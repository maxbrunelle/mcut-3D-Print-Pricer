import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CalculatorState } from './store';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Drive API Logic

const DRIVE_FOLDER_NAME = 'mcut print pricer';
const DATA_FILE_NAME = 'inventory_data.json';

const getHeaders = () => {
  if (!cachedAccessToken) throw new Error('Not authenticated');
  return {
    'Authorization': `Bearer ${cachedAccessToken}`,
    'Content-Type': 'application/json',
  };
};

export const findOrCreateFolder = async (): Promise<string> => {
  const headers = getHeaders();
  
  // Search for folder
  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER_NAME}' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, { headers });
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }
  
  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  const createData = await createRes.json();
  return createData.id;
};

export const saveToDrive = async (data: Partial<CalculatorState>) => {
  const folderId = await findOrCreateFolder();
  const headers = getHeaders();
  
  // Search for file inside the folder
  const query = encodeURIComponent(`name='${DATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, { headers });
  const searchData = await searchRes.json();
  
  const fileContent = JSON.stringify(data, null, 2);
  const metadata = {
    name: DATA_FILE_NAME,
    mimeType: 'application/json',
  };
  
  // Prepare multipart upload
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    close_delim;

  if (searchData.files && searchData.files.length > 0) {
    // Update existing file
    const fileId = searchData.files[0].id;
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody
    });
  } else {
    // Create new file
    metadata['parents'] = [folderId];
    const createMultipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      close_delim;

    await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: createMultipartRequestBody
    });
  }
};

export const loadFromDrive = async (): Promise<Partial<CalculatorState> | null> => {
  const folderId = await findOrCreateFolder();
  const headers = getHeaders();
  
  const query = encodeURIComponent(`name='${DATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, { headers });
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    const fileId = searchData.files[0].id;
    const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers });
    const data = await getRes.json();
    return data;
  }
  return null;
};
