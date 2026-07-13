import * as THREE from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export async function parse3DFile(file: File): Promise<{ volumeCm3?: number, weight?: number, timeHrs?: number }> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'gcode') {
    return parseGCode(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      
      try {
        let totalVolumeMm3 = 0;

        if (extension === '3mf') {
          const loader = new ThreeMFLoader();
          const group = loader.parse(arrayBuffer);
          group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              totalVolumeMm3 += getGeometryVolume(mesh.geometry);
            }
          });
        } else if (extension === 'stl') {
          const loader = new STLLoader();
          const geometry = loader.parse(arrayBuffer);
          totalVolumeMm3 = getGeometryVolume(geometry);
        } else {
          return reject(new Error('Unsupported file format'));
        }

        const volumeCm3 = Math.abs(totalVolumeMm3) / 1000;
        resolve({ volumeCm3 });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

function getGeometryVolume(geometry: THREE.BufferGeometry): number {
  if (!geometry.isBufferGeometry) return 0;
  
  let geom = geometry;
  const positionAttribute = geometry.getAttribute('position');
  if (!positionAttribute) return 0;

  if (!geom.index) {
    geom = geometry.clone();
    const indices = new Uint32Array(positionAttribute.count);
    for (let i = 0; i < positionAttribute.count; i++) indices[i] = i;
    geom.setIndex(new THREE.BufferAttribute(indices, 1));
  }
  
  return calculateSignedVolumeOfGeometry(geom);
}

function calculateSignedVolumeOfGeometry(geometry: THREE.BufferGeometry): number {
  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();
  
  if (!index) return 0;
  
  let sum = 0;
  const p1 = new THREE.Vector3(),
        p2 = new THREE.Vector3(),
        p3 = new THREE.Vector3();

  for (let i = 0; i < index.count; i += 3) {
    p1.fromBufferAttribute(position, index.getX(i));
    p2.fromBufferAttribute(position, index.getX(i + 1));
    p3.fromBufferAttribute(position, index.getX(i + 2));
    sum += p1.dot(p2.cross(p3)) / 6.0;
  }
  return sum;
}

async function parseGCode(file: File): Promise<{ weight: number, timeHrs: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      let weight = 0;
      let timeHrs = 0;

      // Check last 5000 lines for PrusaSlicer/SuperSlicer comments
      for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5000); i--) {
        const line = lines[i];
        
        if (line.includes('filament used [g] =')) {
          const match = line.match(/filament used \[g\] =\s*([\d.]+)/);
          if (match) weight = parseFloat(match[1]);
        }
        
        if (line.includes('estimated printing time (normal mode) =')) {
          let h = 0;
          const dMatch = line.match(/(\d+)d/);
          const hMatch = line.match(/(\d+)h/);
          const mMatch = line.match(/(\d+)m/);
          if (dMatch) h += parseInt(dMatch[1]) * 24;
          if (hMatch) h += parseInt(hMatch[1]);
          if (mMatch) h += parseInt(mMatch[1]) / 60;
          if (h > 0) timeHrs = h;
        }
      }

      // Check first 1000 lines for Cura comments (Cura puts them at top or bottom)
      if (weight === 0 || timeHrs === 0) {
        for (let i = 0; i < Math.min(lines.length, 1000); i++) {
          const line = lines[i];
          
          if (line.includes('Filament used: ') && line.includes('m')) {
            const match = line.match(/Filament used: ([\d.]+)m/);
            if (match && weight === 0) {
              const meters = parseFloat(match[1]);
              // approximate PLA weight: ~2.98g per meter for 1.75mm
              weight = meters * 2.98;
            }
          }
          
          if (line.startsWith(';TIME:')) {
            const seconds = parseInt(line.split(':')[1]);
            if (!isNaN(seconds) && timeHrs === 0) {
              timeHrs = seconds / 3600;
            }
          }
        }
      }

      resolve({ weight: weight > 0 ? weight : 0, timeHrs });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
