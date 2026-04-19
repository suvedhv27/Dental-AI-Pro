// import { useState } from 'react';
// import axios from 'axios';
// import Plot from 'react-plotly.js';

// function App() {
//   const [activeTab, setActiveTab] = useState('home');
//   const [viewMode, setViewMode] = useState('pred'); // 'pred' or 'truth'
//   const [alignMode, setAlignMode] = useState('current'); // 'current' or 'aligned'
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState(null);

//   // OFFICIAL METRICS (Hardcoded from Kaggle results)
//   const metrics = {
//     accuracy: 82.96,
//     iou: 57.18,
//     epochs: 150,
//     dataset: "1,800 Scans"
//   };

//   const handleUpload = async () => {
//     if (!file) return;
//     setLoading(true);
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await axios.post("http://127.0.0.1:8000/predict", formData);
//       setData(res.data);
//     } catch (err) {
//       alert("Error processing file. Make sure backend is running!");
//     }
//     setLoading(false);
//   };

//   const downloadReport = () => {
//     if (!data) return;
//     const text = `DENTAL AI DIAGNOSIS REPORT\n\nDiagnosis: ${data.diagnosis.title}\nDetails:\n${data.diagnosis.details.join('\n')}`;
//     const element = document.createElement("a");
//     const file = new Blob([text], {type: 'text/plain'});
//     element.href = URL.createObjectURL(file);
//     element.download = "diagnosis_report.txt";
//     document.body.appendChild(element);
//     element.click();
//   };

//   return (
//     <div className="min-h-screen p-8 font-sans">
//       {/* HEADER */}
//       <header className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-4xl font-bold text-blue-900">DentalAI<span className="text-blue-500">Pro</span></h1>
//           <p className="text-gray-500">Next-Gen Orthodontic Analysis</p>
//         </div>
//         <div className="flex bg-white rounded-lg p-1 shadow">
//           <button 
//             onClick={() => setActiveTab('home')}
//             className={`px-6 py-2 rounded-md font-semibold transition ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
//             Diagnosis
//           </button>
//           <button 
//             onClick={() => setActiveTab('metrics')}
//             className={`px-6 py-2 rounded-md font-semibold transition ${activeTab === 'metrics' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
//             Model Metrics
//           </button>
//         </div>
//       </header>

//       {/* HOME TAB */}
//       {activeTab === 'home' && (
//         <div className="grid grid-cols-12 gap-6">
          
//           {/* LEFT SIDEBAR: INPUT & REPORT */}
//           <div className="col-span-3 space-y-6">
//             <div className="card p-6">
//               <h3 className="text-lg font-bold mb-4">Patient Data</h3>
//               <input 
//                 type="file" 
//                 onChange={(e) => setFile(e.target.files[0])}
//                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
//               <button 
//                 onClick={handleUpload}
//                 disabled={loading}
//                 className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400">
//                 {loading ? "Processing AI..." : "Run Analysis"}
//               </button>
//             </div>

//             {data && (
//               <div className="card p-6 border-l-4 border-blue-500">
//                 <h3 className="text-gray-500 text-sm uppercase font-bold">Primary Diagnosis</h3>
//                 <p className="text-2xl font-bold text-blue-900 mt-1">{data.diagnosis.title}</p>
//                 <button onClick={downloadReport} className="text-blue-600 text-sm font-semibold mt-4 hover:underline">
//                   Download Report ↓
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* MAIN VISUALIZATION AREA */}
//           <div className="col-span-9 space-y-6">
//             {data ? (
//               <div className="grid grid-cols-2 gap-6">
                
//                 {/* 1. SEGMENTATION CARD */}
//                 <div className="card p-4 h-[500px] relative">
//                   <div className="flex justify-between items-center mb-2">
//                     <h3 className="font-bold">Segmentation Analysis</h3>
//                     <div className="bg-gray-100 rounded-lg p-1 text-xs font-semibold flex">
//                       <button 
//                         onClick={() => setViewMode('truth')}
//                         className={`px-3 py-1 rounded ${viewMode === 'truth' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
//                         Ground Truth
//                       </button>
//                       <button 
//                         onClick={() => setViewMode('pred')}
//                         className={`px-3 py-1 rounded ${viewMode === 'pred' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
//                         AI Prediction
//                       </button>
//                     </div>
//                   </div>

//                   <Plot
//                     data={[{
//                       x: data.points.map(p => p[0]),
//                       y: data.points.map(p => p[1]),
//                       z: data.points.map(p => p[2]),
//                       mode: 'markers', type: 'scatter3d',
//                       marker: { 
//                         size: 3, 
//                         color: viewMode === 'pred' ? data.labels : data.ground_truth, 
//                         colorscale: 'Jet', 
//                         opacity: 0.8 
//                       }
//                     }]}
//                     layout={{ autosize: true, margin: {l:0, r:0, b:0, t:0}, scene: {aspectmode: 'data'} }}
//                     useResizeHandler={true}
//                     style={{width: "100%", height: "90%"}}
//                   />
//                 </div>

//                 {/* 2. ALIGNMENT SIMULATION CARD */}
//                 <div className="card p-4 h-[500px]">
//                   <div className="flex justify-between items-center mb-2">
//                     <h3 className="font-bold">Alignment Target</h3>
//                     <div className="bg-gray-100 rounded-lg p-1 text-xs font-semibold flex">
//                       <button 
//                         onClick={() => setAlignMode('current')}
//                         className={`px-3 py-1 rounded ${alignMode === 'current' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>
//                         Current
//                       </button>
//                       <button 
//                         onClick={() => setAlignMode('aligned')}
//                         className={`px-3 py-1 rounded ${alignMode === 'aligned' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>
//                         Simulate Aligned
//                       </button>
//                     </div>
//                   </div>

//                   <Plot
//                     data={[
//                       {
//                         // The Teeth Dots (Moves based on state)
//                         x: alignMode === 'current' ? data.centroids.map(c => c[0]) : data.aligned_centroids.map(c => c[0]),
//                         y: alignMode === 'current' ? data.centroids.map(c => c[1]) : data.aligned_centroids.map(c => c[1]),
//                         z: alignMode === 'current' ? data.centroids.map(c => c[2]) : data.aligned_centroids.map(c => c[2]),
//                         mode: 'markers+text',
//                         type: 'scatter3d',
//                         text: data.centroid_ids,
//                         textposition: 'top center',
//                         textfont: { color: 'black', size: 10 },
//                         marker: { 
//                           size: 6, 
//                           color: alignMode === 'current' ? 'red' : '#10B981', 
//                           symbol: 'circle' 
//                         },
//                         name: alignMode === 'current' ? 'Misaligned' : 'Aligned'
//                       },
//                       {
//                         // The Green Curve (Static)
//                         x: data.curve.x, y: data.curve.y, z: data.curve.z,
//                         mode: 'lines', type: 'scatter3d',
//                         line: { color: '#10B981', width: 8 }, 
//                         name: 'Target Arch'
//                       },
//                       {
//                         // Movement Paths (Only visible in 'current' mode)
//                         x: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[0], data.aligned_centroids[i][0], null]) : [],
//                         y: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[1], data.aligned_centroids[i][1], null]) : [],
//                         z: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[2], data.aligned_centroids[i][2], null]) : [],
//                         mode: 'lines', type: 'scatter3d',
//                         line: { color: 'gray', width: 2, dash: 'dot' },
//                         showlegend: false,
//                         name: 'Correction Path'
//                       }
//                     ]}
//                     layout={{ 
//                       autosize: true, 
//                       margin: {l:0, r:0, b:0, t:0}, 
//                       scene: {aspectmode: 'data'},
//                       showlegend: true 
//                     }}
//                     useResizeHandler={true}
//                     style={{width: "100%", height: "90%"}}
//                   />
//                 </div>

//               </div>
//             ) : (
//               <div className="card h-[500px] flex items-center justify-center text-gray-400 bg-white">
//                 <p>Upload a .npz file to visualize 3D data</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* METRICS TAB */}
//       {activeTab === 'metrics' && (
//         <div className="grid grid-cols-4 gap-6">
//           <div className="card p-8 text-center">
//             <h3 className="text-gray-500 font-bold">Accuracy</h3>
//             <p className="text-5xl font-bold text-green-600 mt-2">{metrics.accuracy}%</p>
//           </div>
//           <div className="card p-8 text-center">
//             <h3 className="text-gray-500 font-bold">Mean IoU</h3>
//             <p className="text-5xl font-bold text-blue-600 mt-2">{metrics.iou}%</p>
//           </div>
//           <div className="card p-8 text-center">
//             <h3 className="text-gray-500 font-bold">Training Epochs</h3>
//             <p className="text-5xl font-bold text-purple-600 mt-2">{metrics.epochs}</p>
//           </div>
//           <div className="card p-8 text-center">
//             <h3 className="text-gray-500 font-bold">Dataset Size</h3>
//             <p className="text-5xl font-bold text-orange-600 mt-2">{metrics.dataset}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;






// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import Plot from 'react-plotly.js';

// function App() {
//   const [activeTab, setActiveTab] = useState('home');
//   const [viewMode, setViewMode] = useState('pred'); // 'pred' or 'truth'
//   const [alignMode, setAlignMode] = useState('current'); // 'current' or 'aligned'
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState(null);

//   // CHANGED: Use state to hold metrics dynamically
//   const [metrics, setMetrics] = useState({
//     accuracy: 0,
//     precision: 0,
//     recall: 0,
//     f1_score: 0,
//     total_points: "0"
//   });

//   // CHANGED: Fetch metrics from backend on component mount
//   useEffect(() => {
//     const fetchMetrics = async () => {
//       try {
//         const res = await axios.get("http://127.0.0.1:8000/metrics");
//         setMetrics(res.data);
//       } catch (err) {
//         console.error("Error fetching metrics. Ensure backend is running!");
//       }
//     };
//     fetchMetrics();
//   }, []);

//   const handleUpload = async () => {
//     if (!file) return;
//     setLoading(true);
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await axios.post("http://127.0.0.1:8000/predict", formData);
//       setData(res.data);
//     } catch (err) {
//       alert("Error processing file. Make sure backend is running!");
//     }
//     setLoading(false);
//   };

//   const downloadReport = () => {
//     if (!data) return;
//     const text = `DENTAL AI DIAGNOSIS REPORT\n\nDiagnosis: ${data.diagnosis.title}\nDetails:\n${data.diagnosis.details.join('\n')}`;
//     const element = document.createElement("a");
//     const file = new Blob([text], {type: 'text/plain'});
//     element.href = URL.createObjectURL(file);
//     element.download = "diagnosis_report.txt";
//     document.body.appendChild(element);
//     element.click();
//   };

//   return (
//     <div className="min-h-screen p-8 font-sans">
//       {/* HEADER */}
//       <header className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-4xl font-bold text-blue-900">DentalAI<span className="text-blue-500">Pro</span></h1>
//           <p className="text-gray-500">Next-Gen Orthodontic Analysis</p>
//         </div>
//         <div className="flex bg-white rounded-lg p-1 shadow">
//           <button 
//             onClick={() => setActiveTab('home')}
//             className={`px-6 py-2 rounded-md font-semibold transition ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
//             Diagnosis
//           </button>
//           <button 
//             onClick={() => setActiveTab('metrics')}
//             className={`px-6 py-2 rounded-md font-semibold transition ${activeTab === 'metrics' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
//             Model Metrics
//           </button>
//         </div>
//       </header>

//       {/* HOME TAB */}
//       {activeTab === 'home' && (
//         <div className="grid grid-cols-12 gap-6">
          
//           {/* LEFT SIDEBAR: INPUT & REPORT */}
//           <div className="col-span-3 space-y-6">
//             <div className="card p-6">
//               <h3 className="text-lg font-bold mb-4">Patient Data</h3>
//               <input 
//                 type="file" 
//                 onChange={(e) => setFile(e.target.files[0])}
//                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
//               <button 
//                 onClick={handleUpload}
//                 disabled={loading}
//                 className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400">
//                 {loading ? "Processing AI..." : "Run Analysis"}
//               </button>
//             </div>

//             {data && (
//               <div className="card p-6 border-l-4 border-blue-500">
//                 <h3 className="text-gray-500 text-sm uppercase font-bold">Primary Diagnosis</h3>
//                 <p className="text-2xl font-bold text-blue-900 mt-1">{data.diagnosis.title}</p>
//                 <button onClick={downloadReport} className="text-blue-600 text-sm font-semibold mt-4 hover:underline">
//                   Download Report ↓
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* MAIN VISUALIZATION AREA */}
//           <div className="col-span-9 space-y-6">
//             {data ? (
//               <div className="grid grid-cols-2 gap-6">
                
//                 {/* 1. SEGMENTATION CARD */}
//                 <div className="card p-4 h-[500px] relative">
//                   <div className="flex justify-between items-center mb-2">
//                     <h3 className="font-bold">Segmentation Analysis</h3>
//                     <div className="bg-gray-100 rounded-lg p-1 text-xs font-semibold flex">
//                       <button 
//                         onClick={() => setViewMode('truth')}
//                         className={`px-3 py-1 rounded ${viewMode === 'truth' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
//                         Ground Truth
//                       </button>
//                       <button 
//                         onClick={() => setViewMode('pred')}
//                         className={`px-3 py-1 rounded ${viewMode === 'pred' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
//                         AI Prediction
//                       </button>
//                     </div>
//                   </div>

//                   <Plot
//                     data={[{
//                       x: data.points.map(p => p[0]),
//                       y: data.points.map(p => p[1]),
//                       z: data.points.map(p => p[2]),
//                       mode: 'markers', type: 'scatter3d',
//                       marker: { 
//                         size: 3, 
//                         color: viewMode === 'pred' ? data.labels : data.ground_truth, 
//                         colorscale: 'Jet', 
//                         opacity: 0.8 
//                       }
//                     }]}
//                     layout={{ autosize: true, margin: {l:0, r:0, b:0, t:0}, scene: {aspectmode: 'data'} }}
//                     useResizeHandler={true}
//                     style={{width: "100%", height: "90%"}}
//                   />
//                 </div>

//                 {/* 2. ALIGNMENT SIMULATION CARD */}
//                 <div className="card p-4 h-[500px]">
//                   <div className="flex justify-between items-center mb-2">
//                     <h3 className="font-bold">Alignment Target</h3>
//                     <div className="bg-gray-100 rounded-lg p-1 text-xs font-semibold flex">
//                       <button 
//                         onClick={() => setAlignMode('current')}
//                         className={`px-3 py-1 rounded ${alignMode === 'current' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>
//                         Current
//                       </button>
//                       <button 
//                         onClick={() => setAlignMode('aligned')}
//                         className={`px-3 py-1 rounded ${alignMode === 'aligned' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>
//                         Simulate Aligned
//                       </button>
//                     </div>
//                   </div>

//                   <Plot
//                     data={[
//                       {
//                         // The Teeth Dots (Moves based on state)
//                         x: alignMode === 'current' ? data.centroids.map(c => c[0]) : data.aligned_centroids.map(c => c[0]),
//                         y: alignMode === 'current' ? data.centroids.map(c => c[1]) : data.aligned_centroids.map(c => c[1]),
//                         z: alignMode === 'current' ? data.centroids.map(c => c[2]) : data.aligned_centroids.map(c => c[2]),
//                         mode: 'markers+text',
//                         type: 'scatter3d',
//                         text: data.centroid_ids,
//                         textposition: 'top center',
//                         textfont: { color: 'black', size: 10 },
//                         marker: { 
//                           size: 6, 
//                           color: alignMode === 'current' ? 'red' : '#10B981', 
//                           symbol: 'circle' 
//                         },
//                         name: alignMode === 'current' ? 'Misaligned' : 'Aligned'
//                       },
//                       {
//                         // The Green Curve (Static)
//                         x: data.curve.x, y: data.curve.y, z: data.curve.z,
//                         mode: 'lines', type: 'scatter3d',
//                         line: { color: '#10B981', width: 8 }, 
//                         name: 'Target Arch'
//                       },
//                       {
//                         // Movement Paths (Only visible in 'current' mode)
//                         x: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[0], data.aligned_centroids[i][0], null]) : [],
//                         y: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[1], data.aligned_centroids[i][1], null]) : [],
//                         z: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[2], data.aligned_centroids[i][2], null]) : [],
//                         mode: 'lines', type: 'scatter3d',
//                         line: { color: 'gray', width: 2, dash: 'dot' },
//                         showlegend: false,
//                         name: 'Correction Path'
//                       }
//                     ]}
//                     layout={{ 
//                       autosize: true, 
//                       margin: {l:0, r:0, b:0, t:0}, 
//                       scene: {aspectmode: 'data'},
//                       showlegend: true 
//                     }}
//                     useResizeHandler={true}
//                     style={{width: "100%", height: "90%"}}
//                   />
//                 </div>

//               </div>
//             ) : (
//               <div className="card h-[500px] flex items-center justify-center text-gray-400 bg-white shadow-sm rounded-lg">
//                 <p>Upload a .npz file to visualize 3D data</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* CHANGED: METRICS TAB NOW DISPLAYS FETCHED DATA */}
//       {activeTab === 'metrics' && (
//         <div className="grid grid-cols-4 gap-6">
//           <div className="card p-8 text-center shadow-sm bg-white rounded-lg">
//             <h3 className="text-gray-500 font-bold">Overall Accuracy</h3>
//             <p className="text-5xl font-bold text-green-600 mt-2">{metrics.accuracy}%</p>
//           </div>
//           <div className="card p-8 text-center shadow-sm bg-white rounded-lg">
//             <h3 className="text-gray-500 font-bold">Weighted Precision</h3>
//             <p className="text-5xl font-bold text-blue-600 mt-2">{metrics.precision}%</p>
//           </div>
//           <div className="card p-8 text-center shadow-sm bg-white rounded-lg">
//             <h3 className="text-gray-500 font-bold">Weighted Recall</h3>
//             <p className="text-5xl font-bold text-purple-600 mt-2">{metrics.recall}%</p>
//           </div>
//           <div className="card p-8 text-center shadow-sm bg-white rounded-lg">
//             <h3 className="text-gray-500 font-bold">Weighted F1 Score</h3>
//             <p className="text-5xl font-bold text-orange-600 mt-2">{metrics.f1_score}%</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;











// import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import Plot from 'react-plotly.js';
// import './App.css';

// /* ─── Icons ─────────────────────────────────────────── */
// const IconDownload = () => (
//   <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
//     <polyline points="7 10 12 15 17 10"/>
//     <line x1="12" y1="15" x2="12" y2="3"/>
//   </svg>
// );

// const IconTooth = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M12 2C8 2 5 5 5 8c0 2 .5 3.5 1 5.5C7 17 7.5 21 9 21c1 0 2-2 3-2s2 2 3 2c1.5 0 2-4 3-7.5.5-2 1-3.5 1-5.5 0-3-3-6-7-6z"/>
//   </svg>
// );

// const IconScan = () => (
//   <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
//     <line x1="3" y1="12" x2="21" y2="12"/>
//   </svg>
// );

// const IconMetrics = () => (
//   <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M18 20V10M12 20V4M6 20v-6"/>
//   </svg>
// );

// const LogoIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
//     <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
//   </svg>
// );

// /* ─── Helpers ────────────────────────────────────────── */
// function diagClass(title) {
//   if (!title) return 'normal';
//   const t = title.toLowerCase();
//   if (t.includes('normal'))  return 'normal';
//   if (t.includes('mild'))    return 'mild';
//   if (t.includes('severe'))  return 'severe';
//   return 'misalign';
// }

// function diagSeverityLabel(cls) {
//   return { normal: 'All clear', mild: 'Mild concern', severe: 'Attention needed', misalign: 'Attention needed' }[cls] || '';
// }

// function formatBytes(bytes) {
//   if (!bytes) return '';
//   return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(0)} KB`;
// }

// /* ─── Light Plotly layout ────────────────────────────── */
// const darkLayout = {
//   paper_bgcolor: '#f8fafc',
//   plot_bgcolor:  '#f8fafc',
//   margin: { l: 0, r: 0, b: 0, t: 0 },
//   scene: {
//     aspectmode: 'data',
//     bgcolor: '#f8fafc',
//     xaxis: {
//       showgrid: true, zeroline: true, showticklabels: true, showspikes: true,
//       gridcolor: '#dce3ea', zerolinecolor: '#b0bec5',
//       tickfont: { color: '#7a94aa', size: 9, family: 'DM Mono' },
//       title: { text: 'X', font: { color: '#7a94aa', size: 10 } },
//     },
//     yaxis: {
//       showgrid: true, zeroline: true, showticklabels: true, showspikes: true,
//       gridcolor: '#dce3ea', zerolinecolor: '#b0bec5',
//       tickfont: { color: '#7a94aa', size: 9, family: 'DM Mono' },
//       title: { text: 'Y', font: { color: '#7a94aa', size: 10 } },
//     },
//     zaxis: {
//       showgrid: true, zeroline: true, showticklabels: true, showspikes: true,
//       gridcolor: '#dce3ea', zerolinecolor: '#b0bec5',
//       tickfont: { color: '#7a94aa', size: 9, family: 'DM Mono' },
//       title: { text: 'Z', font: { color: '#7a94aa', size: 10 } },
//     },
//   },
//   legend: {
//     bgcolor: 'rgba(255,255,255,0.9)',
//     bordercolor: 'rgba(0,0,0,0.08)',
//     borderwidth: 1,
//     font: { color: '#3d5166', size: 11, family: 'DM Sans' },
//   },
//   font: { family: 'DM Sans', color: '#3d5166' },
// };

// const customColorscale = [
//   [0,    '#2563eb'],
//   [0.14, '#0891b2'],
//   [0.28, '#059669'],
//   [0.42, '#d97706'],
//   [0.57, '#dc2626'],
//   [0.71, '#7c3aed'],
//   [0.85, '#db2777'],
//   [1,    '#374151'],
// ];

// /* ─── Skeleton loader ────────────────────────────────── */
// function SkeletonCharts() {
//   return (
//     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//       {[0, 1].map(i => (
//         <div key={i} className="panel fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
//           <div className="panel-header">
//             <div className="skeleton" style={{ height: 14, width: 160, borderRadius: 4 }} />
//             <div className="skeleton" style={{ height: 28, width: 140, borderRadius: 8 }} />
//           </div>
//           <div style={{ padding: '12px 12px 0' }}>
//             <div className="skeleton skeleton-chart" />
//           </div>
//           <div style={{ height: 12 }} />
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ─── App ────────────────────────────────────────────── */
// export default function App() {
//   const [activeTab, setActiveTab] = useState('diagnosis');
//   const [viewMode,  setViewMode]  = useState('pred');
//   const [alignMode, setAlignMode] = useState('current');
//   const [file,      setFile]      = useState(null);
//   const [loading,   setLoading]   = useState(false);
//   const [data,      setData]      = useState(null);
//   const [dragOver,  setDragOver]  = useState(false);
//   const [serverOk,  setServerOk]  = useState(null);
//   const fileInputRef              = useRef(null);

//   const [metrics, setMetrics] = useState({
//     accuracy: 0, precision: 0, recall: 0, f1_score: 0, total_points: '0'
//   });

//   useEffect(() => {
//     axios.get('http://127.0.0.1:8000/metrics')
//       .then(r => { setMetrics(r.data); setServerOk(true); })
//       .catch(() => setServerOk(false));
//   }, []);

//   const handleFile = (f) => { if (f?.name.endsWith('.npz')) setFile(f); };

//   const handleUpload = async () => {
//     if (!file) return;
//     setLoading(true); setData(null);
//     const fd = new FormData();
//     fd.append('file', file);
//     try {
//       const res = await axios.post('http://127.0.0.1:8000/predict', fd);
//       setData(res.data);
//     } catch {
//       alert('Backend error — make sure FastAPI is running on port 8000.');
//     }
//     setLoading(false);
//   };

//   const downloadReport = () => {
//     if (!data) return;
//     const lines = [
//       'DENTALAI PRO — DIAGNOSIS REPORT',
//       '================================',
//       '',
//       `Diagnosis : ${data.diagnosis.title}`,
//       '',
//       'Details:',
//       ...(data.diagnosis.details.length
//         ? data.diagnosis.details.map(d => `  • ${d}`)
//         : ['  No issues detected']),
//       '',
//       `Generated : ${new Date().toLocaleString()}`,
//     ];
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
//     a.download = 'diagnosis_report.txt';
//     a.click();
//   };

//   /* ── Sidebar ──────────────────────────────────────── */
//   const navItems = [
//     { id: 'diagnosis', label: 'Scan Diagnosis', Icon: IconScan },
//     { id: 'metrics',   label: 'Model Metrics',  Icon: IconMetrics },
//   ];

//   const Sidebar = () => (
//     <aside className="sidebar">
//       <div className="sidebar-logo">
//         <div className="logo-mark">
//           <div className="logo-icon"><LogoIcon /></div>
//           <div className="logo-text">
//             <span className="logo-name">DentalAI<span style={{ color: 'var(--cyan)' }}>Pro</span></span>
//             <span className="logo-sub">Orthodontic AI</span>
//           </div>
//         </div>
//       </div>

//       <nav className="sidebar-nav">
//         <span className="nav-label">Analysis</span>
//         {navItems.map(({ id, label, Icon }) => (
//           <button
//             key={id}
//             className={`nav-btn ${activeTab === id ? 'active' : ''}`}
//             onClick={() => setActiveTab(id)}
//           >
//             <span className="nav-icon"><Icon /></span>
//             {label}
//           </button>
//         ))}

//         <span className="nav-label" style={{ marginTop: 20 }}>Reports</span>
//         <button className="nav-btn" onClick={downloadReport} disabled={!data} style={{ opacity: data ? 1 : 0.4 }}>
//           <span className="nav-icon"><IconDownload /></span>
//           Export Report
//         </button>
//       </nav>

//       <div className="sidebar-footer">
//         <div className="server-status">
//           <div className={`status-dot ${serverOk === false ? 'offline' : ''}`} />
//           {serverOk === null ? 'Connecting…' : serverOk ? 'Backend connected' : 'Backend offline'}
//         </div>
//       </div>
//     </aside>
//   );

//   /* ── Diagnosis tab ────────────────────────────────── */
//   const DiagnosisTab = () => {
//     const dClass = data ? diagClass(data.diagnosis.title) : '';
//     return (
//       <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>

//         {/* Left panel */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//           <div className="panel fade-up">
//             <div className="panel-header">
//               <span className="panel-title">
//                 <span className="panel-title-dot" />
//                 Patient Scan
//               </span>
//             </div>
//             <div className="panel-body">
//               {/* Drag-and-drop upload zone */}
//               <div
//                 className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
//                 onDragOver={e => { e.preventDefault(); setDragOver(true); }}
//                 onDragLeave={() => setDragOver(false)}
//                 onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept=".npz"
//                   style={{ display: 'none' }}
//                   onChange={e => handleFile(e.target.files[0])}
//                 />
//                 <div className="upload-icon">
//                   <svg viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
//                     style={{ width: 20, height: 20, stroke: 'var(--cyan)', fill: 'none' }}>
//                     <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
//                     <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
//                   </svg>
//                 </div>
//                 <div className="upload-title">Drop .npz scan file</div>
//                 <div className="upload-sub">or click to browse</div>
//               </div>

//               {file && (
//                 <div className="file-badge">
//                   <span className="file-badge-name">{file.name}</span>
//                   <span className="file-badge-size">{formatBytes(file.size)}</span>
//                 </div>
//               )}

//               <button
//                 className="run-btn"
//                 style={{ marginTop: 12 }}
//                 onClick={handleUpload}
//                 disabled={!file || loading}
//               >
//                 {loading ? 'Analysing…' : 'Run AI Analysis'}
//               </button>
//             </div>
//           </div>

//           {/* Diagnosis result */}
//           {data && (
//             <div className="fade-up">
//               <div className={`diag-card ${dClass}`}>
//                 <div className="diag-severity">{diagSeverityLabel(dClass)}</div>
//                 <div className="diag-title">{data.diagnosis.title}</div>
//                 {data.diagnosis.details.length === 0 ? (
//                   <div className="diag-none">No issues detected</div>
//                 ) : data.diagnosis.details.map((d, i) => (
//                   <div key={i} className="diag-detail">
//                     <div className="diag-bullet" />
//                     {d}
//                   </div>
//                 ))}
//               </div>
//               <button className="download-btn" onClick={downloadReport}>
//                 <IconDownload />
//                 Download Report
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Right charts */}
//         <div>
//           {loading ? <SkeletonCharts /> : data ? (
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

//               {/* Segmentation */}
//               <div className="panel fade-up fade-up-1">
//                 <div className="panel-header">
//                   <span className="panel-title">
//                     <span className="panel-title-dot" />
//                     Segmentation
//                   </span>
//                   <div className="toggle-pill">
//                     <button className={`toggle-btn ${viewMode === 'truth' ? 'active-truth' : ''}`} onClick={() => setViewMode('truth')}>Ground Truth</button>
//                     <button className={`toggle-btn ${viewMode === 'pred'  ? 'active-pred'  : ''}`} onClick={() => setViewMode('pred')}>AI Prediction</button>
//                   </div>
//                 </div>
//                 <div style={{ padding: '12px 12px 0' }}>
//                   <div className="chart-wrap">
//                     <Plot
//                       data={[{
//                         x: data.points.map(p => p[0]),
//                         y: data.points.map(p => p[1]),
//                         z: data.points.map(p => p[2]),
//                         mode: 'markers', type: 'scatter3d',
//                         marker: {
//                           size: 2.5,
//                           color: viewMode === 'pred' ? data.labels : data.ground_truth,
//                           colorscale: customColorscale,
//                           opacity: 0.85,
//                         },
//                       }]}
//                       layout={{ ...darkLayout, autosize: true }}
//                       useResizeHandler
//                       style={{ width: '100%', height: 400 }}
//                       config={{ displayModeBar: false }}
//                     />
//                   </div>
//                 </div>
//                 <div style={{ height: 12 }} />
//               </div>

//               {/* Alignment */}
//               <div className="panel fade-up fade-up-2">
//                 <div className="panel-header">
//                   <span className="panel-title">
//                     <span className="panel-title-dot" style={{ background: 'var(--green)' }} />
//                     Alignment
//                   </span>
//                   <div className="toggle-pill">
//                     <button className={`toggle-btn ${alignMode === 'current' ? 'active-current' : ''}`} onClick={() => setAlignMode('current')}>Current</button>
//                     <button className={`toggle-btn ${alignMode === 'aligned' ? 'active-aligned' : ''}`} onClick={() => setAlignMode('aligned')}>Simulated</button>
//                   </div>
//                 </div>
//                 <div style={{ padding: '12px 12px 0' }}>
//                   <div className="chart-wrap">
//                     <Plot
//                       data={[
//                         {
//                           x: (alignMode === 'current' ? data.centroids : data.aligned_centroids).map(c => c[0]),
//                           y: (alignMode === 'current' ? data.centroids : data.aligned_centroids).map(c => c[1]),
//                           z: (alignMode === 'current' ? data.centroids : data.aligned_centroids).map(c => c[2]),
//                           mode: 'markers+text', type: 'scatter3d',
//                           text: data.centroid_ids,
//                           textposition: 'top center',
//                           textfont: { color: '#3d5166', size: 9, family: 'DM Mono' },
//                           marker: {
//                             size: 7,
//                             color: alignMode === 'current' ? '#dc2626' : '#059669',
//                             symbol: 'circle',
//                             line: { color: alignMode === 'current' ? 'rgba(220,38,38,0.25)' : 'rgba(5,150,105,0.25)', width: 6 },
//                           },
//                           name: alignMode === 'current' ? 'Current position' : 'Aligned position',
//                         },
//                         {
//                           x: data.curve.x, y: data.curve.y, z: data.curve.z,
//                           mode: 'lines', type: 'scatter3d',
//                           line: { color: '#059669', width: 6 },
//                           name: 'Target arch',
//                         },
//                         {
//                           x: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[0], data.aligned_centroids[i][0], null]) : [],
//                           y: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[1], data.aligned_centroids[i][1], null]) : [],
//                           z: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[2], data.aligned_centroids[i][2], null]) : [],
//                           mode: 'lines', type: 'scatter3d',
//                           line: { color: 'rgba(100,120,140,0.4)', width: 1.5, dash: 'dot' },
//                           showlegend: false, name: 'Correction path',
//                         },
//                       ]}
//                       layout={{ ...darkLayout, autosize: true, showlegend: true }}
//                       useResizeHandler
//                       style={{ width: '100%', height: 400 }}
//                       config={{ displayModeBar: false }}
//                     />
//                   </div>
//                 </div>
//                 <div style={{ height: 12 }} />
//               </div>
//             </div>
//           ) : (
//             <div className="empty-state fade-up">
//               <IconTooth />
//               <div className="empty-title">No scan loaded</div>
//               <div className="empty-sub">Upload a .npz file to begin analysis</div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   /* ── Metrics tab ──────────────────────────────────── */
//   const MetricsTab = () => (
//     <div className="fade-up">
//       <div className="section-head">Model performance</div>
//       <div className="metrics-grid">
//         {[
//           { label: 'Overall Accuracy',    value: `${metrics.accuracy}%`,   cls: 'mc-green', sub: 'Point-level classification' },
//           { label: 'Weighted Precision',  value: `${metrics.precision}%`,  cls: 'mc-cyan',  sub: 'True positive rate' },
//           { label: 'Weighted Recall',     value: `${metrics.recall}%`,     cls: 'mc-amber', sub: 'Sensitivity' },
//           { label: 'F1 Score',            value: `${metrics.f1_score}%`,   cls: 'mc-red',   sub: 'Harmonic mean' },
//         ].map((m, i) => (
//           <div key={i} className={`metric-card ${m.cls} fade-up`} style={{ animationDelay: `${i * 0.07}s` }}>
//             <div className="metric-label">{m.label}</div>
//             <div className="metric-value">{m.value}</div>
//             <div className="metric-sub">{m.sub}</div>
//           </div>
//         ))}
//       </div>

//       <div className="section-head" style={{ marginTop: 28 }}>Dataset information</div>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
//         {[
//           { label: 'Architecture',            value: 'PointNet',            sub: 'Segmentation variant' },
//           { label: 'Total points evaluated',  value: metrics.total_points,  sub: 'Across test set' },
//           { label: 'Output classes',          value: '50',                  sub: 'Tooth IDs + background' },
//         ].map((m, i) => (
//           <div key={i} className="metric-card fade-up" style={{ animationDelay: `${i * 0.07 + 0.28}s` }}>
//             <div className="metric-label">{m.label}</div>
//             <div className="metric-value" style={{ fontSize: 26, color: 'var(--text-1)', fontWeight: 300 }}>
//               {m.value}
//             </div>
//             <div className="metric-sub">{m.sub}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   /* ── Topbar meta ──────────────────────────────────── */
//   const topbarMeta = {
//     diagnosis: { title: 'Scan Diagnosis', sub: 'Upload a 3D dental point cloud (.npz) and run AI segmentation' },
//     metrics:   { title: 'Model Metrics',  sub: 'PointNet segmentation performance on the validation dataset' },
//   };

//   return (
//     <div className="app-shell">
//       <Sidebar />
//       <div className="main-content">
//         <div className="topbar">
//           <div>
//             <div className="topbar-title">{topbarMeta[activeTab].title}</div>
//             <div className="topbar-sub">{topbarMeta[activeTab].sub}</div>
//           </div>
//           <div style={{
//             width: 34, height: 34, borderRadius: '50%',
//             background: 'var(--navy-4)', border: '1px solid var(--border-md)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 11, fontWeight: 600, color: 'var(--cyan)', letterSpacing: 0.03,
//           }}>Dr</div>
//         </div>
//         <div className="page-body">
//           {activeTab === 'diagnosis' && <DiagnosisTab />}
//           {activeTab === 'metrics'   && <MetricsTab />}
//         </div>
//       </div>
//     </div>
//   );
// }

// Loginpage
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './App.css';
import Login from './Login';

/* ─── Icons ─────────────────────────────────────────── */
const IconDownload = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconTooth = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 5 5 5 8c0 2 .5 3.5 1 5.5C7 17 7.5 21 9 21c1 0 2-2 3-2s2 2 3 2c1.5 0 2-4 3-7.5.5-2 1-3.5 1-5.5 0-3-3-6-7-6z"/>
  </svg>
);

const IconScan = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
  </svg>
);

const IconMetrics = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

/* ─── Helpers ────────────────────────────────────────── */
function diagClass(title) {
  if (!title) return 'normal';
  const t = title.toLowerCase();
  if (t.includes('normal'))  return 'normal';
  if (t.includes('mild'))    return 'mild';
  if (t.includes('severe'))  return 'severe';
  return 'misalign';
}

function diagSeverityLabel(cls) {
  return { normal: 'All clear', mild: 'Mild concern', severe: 'Attention needed', misalign: 'Attention needed' }[cls] || '';
}

function formatBytes(bytes) {
  if (!bytes) return '';
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(0)} KB`;
}

/* ─── Light Plotly layout ────────────────────────────── */
const darkLayout = {
  paper_bgcolor: '#f8fafc',
  plot_bgcolor:  '#f8fafc',
  margin: { l: 0, r: 0, b: 0, t: 0 },
  scene: {
    aspectmode: 'data',
    bgcolor: '#f8fafc',
    xaxis: {
      showgrid: true, zeroline: true, showticklabels: true, showspikes: true,
      gridcolor: '#dce3ea', zerolinecolor: '#b0bec5',
      tickfont: { color: '#7a94aa', size: 9, family: 'DM Mono' },
      title: { text: 'X', font: { color: '#7a94aa', size: 10 } },
    },
    yaxis: {
      showgrid: true, zeroline: true, showticklabels: true, showspikes: true,
      gridcolor: '#dce3ea', zerolinecolor: '#b0bec5',
      tickfont: { color: '#7a94aa', size: 9, family: 'DM Mono' },
      title: { text: 'Y', font: { color: '#7a94aa', size: 10 } },
    },
    zaxis: {
      showgrid: true, zeroline: true, showticklabels: true, showspikes: true,
      gridcolor: '#dce3ea', zerolinecolor: '#b0bec5',
      tickfont: { color: '#7a94aa', size: 9, family: 'DM Mono' },
      title: { text: 'Z', font: { color: '#7a94aa', size: 10 } },
    },
  },
  legend: {
    bgcolor: 'rgba(255,255,255,0.9)',
    bordercolor: 'rgba(0,0,0,0.08)',
    borderwidth: 1,
    font: { color: '#3d5166', size: 11, family: 'DM Sans' },
  },
  font: { family: 'DM Sans', color: '#3d5166' },
};

const customColorscale = [
  [0,    '#2563eb'],
  [0.14, '#0891b2'],
  [0.28, '#059669'],
  [0.42, '#d97706'],
  [0.57, '#dc2626'],
  [0.71, '#7c3aed'],
  [0.85, '#db2777'],
  [1,    '#374151'],
];

/* ─── Skeleton loader ────────────────────────────────── */
function SkeletonCharts() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {[0, 1].map(i => (
        <div key={i} className="panel fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="panel-header">
            <div className="skeleton" style={{ height: 14, width: 160, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 28, width: 140, borderRadius: 8 }} />
          </div>
          <div style={{ padding: '12px 12px 0' }}>
            <div className="skeleton skeleton-chart" />
          </div>
          <div style={{ height: 12 }} />
        </div>
      ))}
    </div>
  );
}

/* ─── App ────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [viewMode,  setViewMode]  = useState('pred');
  const [alignMode, setAlignMode] = useState('current');
  const [file,      setFile]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [data,      setData]      = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [serverOk,  setServerOk]  = useState(null);
  const fileInputRef              = useRef(null);

  const [metrics, setMetrics] = useState({
    accuracy: 0, precision: 0, recall: 0, f1_score: 0, total_points: '0'
  });

  // ── Auth state ──
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dental_user')) || null; }
    catch { return null; }
  });

  const handleLogin = (userData) => {
    sessionStorage.setItem('dental_user', JSON.stringify(userData));
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dental_user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setData(null);
    setFile(null);
  };

  // restore token on page refresh
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    axios.get('http://127.0.0.1:8000/metrics')
      .then(r => { setMetrics(r.data); setServerOk(true); })
      .catch(() => setServerOk(false));
  }, [user]);

  const handleFile = (f) => { if (f?.name.endsWith('.npz')) setFile(f); };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setData(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('http://127.0.0.1:8000/predict', fd);
      setData(res.data);
    } catch {
      alert('Backend error — make sure FastAPI is running on port 8000.');
    }
    setLoading(false);
  };

  const downloadReport = () => {
    if (!data) return;
    const lines = [
      'DENTALAI PRO — DIAGNOSIS REPORT',
      '================================',
      '',
      `Diagnosis : ${data.diagnosis.title}`,
      '',
      'Details:',
      ...(data.diagnosis.details.length
        ? data.diagnosis.details.map(d => `  • ${d}`)
        : ['  No issues detected']),
      '',
      `Generated : ${new Date().toLocaleString()}`,
    ];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
    a.download = 'diagnosis_report.txt';
    a.click();
  };

  /* ── Sidebar ──────────────────────────────────────── */
  const navItems = [
    { id: 'diagnosis', label: 'Scan Diagnosis', Icon: IconScan },
    { id: 'metrics',   label: 'Model Metrics',  Icon: IconMetrics },
  ];

  const Sidebar = () => (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon"><LogoIcon /></div>
          <div className="logo-text">
            <span className="logo-name">DentalAI<span style={{ color: 'var(--cyan)' }}>Pro</span></span>
            <span className="logo-sub">Orthodontic AI</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-label">Analysis</span>
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <span className="nav-icon"><Icon /></span>
            {label}
          </button>
        ))}

        <span className="nav-label" style={{ marginTop: 20 }}>Reports</span>
        <button className="nav-btn" onClick={downloadReport} disabled={!data} style={{ opacity: data ? 1 : 0.4 }}>
          <span className="nav-icon"><IconDownload /></span>
          Export Report
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">
            {user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'Dr'}
          </div>
          {user?.name || 'Doctor'}
          {user?.role && (
            <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto',
              background: 'var(--navy-3)', padding: '1px 6px', borderRadius: 4 }}>
              {user.role}
            </span>
          )}
        </div>
        <div className="server-status" style={{ marginBottom: 10 }}>
          <div className={`status-dot ${serverOk === false ? 'offline' : ''}`} />
          {serverOk === null ? 'Connecting…' : serverOk ? 'Backend connected' : 'Backend offline'}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );

  /* ── Diagnosis tab ────────────────────────────────── */
  const DiagnosisTab = () => {
    const dClass = data ? diagClass(data.diagnosis.title) : '';
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="panel fade-up">
            <div className="panel-header">
              <span className="panel-title">
                <span className="panel-title-dot" />
                Patient Scan
              </span>
            </div>
            <div className="panel-body">
              {/* Drag-and-drop upload zone */}
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".npz"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                    style={{ width: 20, height: 20, stroke: 'var(--cyan)', fill: 'none' }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="upload-title">Drop .npz scan file</div>
                <div className="upload-sub">or click to browse</div>
              </div>

              {file && (
                <div className="file-badge">
                  <span className="file-badge-name">{file.name}</span>
                  <span className="file-badge-size">{formatBytes(file.size)}</span>
                </div>
              )}

              <button
                className="run-btn"
                style={{ marginTop: 12 }}
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? 'Analysing…' : 'Run AI Analysis'}
              </button>
            </div>
          </div>

          {/* Diagnosis result */}
          {data && (
            <div className="fade-up">
              <div className={`diag-card ${dClass}`}>
                <div className="diag-severity">{diagSeverityLabel(dClass)}</div>
                <div className="diag-title">{data.diagnosis.title}</div>
                {data.diagnosis.details.length === 0 ? (
                  <div className="diag-none">No issues detected</div>
                ) : data.diagnosis.details.map((d, i) => (
                  <div key={i} className="diag-detail">
                    <div className="diag-bullet" />
                    {d}
                  </div>
                ))}
              </div>
              <button className="download-btn" onClick={downloadReport}>
                <IconDownload />
                Download Report
              </button>
            </div>
          )}
        </div>

        {/* Right charts */}
        <div>
          {loading ? <SkeletonCharts /> : data ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Segmentation */}
              <div className="panel fade-up fade-up-1">
                <div className="panel-header">
                  <span className="panel-title">
                    <span className="panel-title-dot" />
                    Segmentation
                  </span>
                  <div className="toggle-pill">
                    <button className={`toggle-btn ${viewMode === 'truth' ? 'active-truth' : ''}`} onClick={() => setViewMode('truth')}>Ground Truth</button>
                    <button className={`toggle-btn ${viewMode === 'pred'  ? 'active-pred'  : ''}`} onClick={() => setViewMode('pred')}>AI Prediction</button>
                  </div>
                </div>
                <div style={{ padding: '12px 12px 0' }}>
                  <div className="chart-wrap">
                    <Plot
                      data={[{
                        x: data.points.map(p => p[0]),
                        y: data.points.map(p => p[1]),
                        z: data.points.map(p => p[2]),
                        mode: 'markers', type: 'scatter3d',
                        marker: {
                          size: 2.5,
                          color: viewMode === 'pred' ? data.labels : data.ground_truth,
                          colorscale: customColorscale,
                          opacity: 0.85,
                        },
                      }]}
                      layout={{ ...darkLayout, autosize: true }}
                      useResizeHandler
                      style={{ width: '100%', height: 400 }}
                      config={{ displayModeBar: false }}
                    />
                  </div>
                </div>
                <div style={{ height: 12 }} />
              </div>

              {/* Alignment */}
              <div className="panel fade-up fade-up-2">
                <div className="panel-header">
                  <span className="panel-title">
                    <span className="panel-title-dot" style={{ background: 'var(--green)' }} />
                    Alignment
                  </span>
                  <div className="toggle-pill">
                    <button className={`toggle-btn ${alignMode === 'current' ? 'active-current' : ''}`} onClick={() => setAlignMode('current')}>Current</button>
                    <button className={`toggle-btn ${alignMode === 'aligned' ? 'active-aligned' : ''}`} onClick={() => setAlignMode('aligned')}>Simulated</button>
                  </div>
                </div>
                <div style={{ padding: '12px 12px 0' }}>
                  <div className="chart-wrap">
                    <Plot
                      data={[
                        {
                          x: (alignMode === 'current' ? data.centroids : data.aligned_centroids).map(c => c[0]),
                          y: (alignMode === 'current' ? data.centroids : data.aligned_centroids).map(c => c[1]),
                          z: (alignMode === 'current' ? data.centroids : data.aligned_centroids).map(c => c[2]),
                          mode: 'markers+text', type: 'scatter3d',
                          text: data.centroid_ids,
                          textposition: 'top center',
                          textfont: { color: '#3d5166', size: 9, family: 'DM Mono' },
                          marker: {
                            size: 7,
                            color: alignMode === 'current' ? '#dc2626' : '#059669',
                            symbol: 'circle',
                            line: { color: alignMode === 'current' ? 'rgba(220,38,38,0.25)' : 'rgba(5,150,105,0.25)', width: 6 },
                          },
                          name: alignMode === 'current' ? 'Current position' : 'Aligned position',
                        },
                        {
                          x: data.curve.x, y: data.curve.y, z: data.curve.z,
                          mode: 'lines', type: 'scatter3d',
                          line: { color: '#059669', width: 6 },
                          name: 'Target arch',
                        },
                        {
                          x: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[0], data.aligned_centroids[i][0], null]) : [],
                          y: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[1], data.aligned_centroids[i][1], null]) : [],
                          z: alignMode === 'current' ? data.centroids.flatMap((c, i) => [c[2], data.aligned_centroids[i][2], null]) : [],
                          mode: 'lines', type: 'scatter3d',
                          line: { color: 'rgba(100,120,140,0.4)', width: 1.5, dash: 'dot' },
                          showlegend: false, name: 'Correction path',
                        },
                      ]}
                      layout={{ ...darkLayout, autosize: true, showlegend: true }}
                      useResizeHandler
                      style={{ width: '100%', height: 400 }}
                      config={{ displayModeBar: false }}
                    />
                  </div>
                </div>
                <div style={{ height: 12 }} />
              </div>
            </div>
          ) : (
            <div className="empty-state fade-up">
              <IconTooth />
              <div className="empty-title">No scan loaded</div>
              <div className="empty-sub">Upload a .npz file to begin analysis</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Metrics tab ──────────────────────────────────── */
  const MetricsTab = () => (
    <div className="fade-up">
      <div className="section-head">Model performance</div>
      <div className="metrics-grid">
        {[
          { label: 'Overall Accuracy',    value: `${metrics.accuracy}%`,   cls: 'mc-green', sub: 'Point-level classification' },
          { label: 'Weighted Precision',  value: `${metrics.precision}%`,  cls: 'mc-cyan',  sub: 'True positive rate' },
          { label: 'Weighted Recall',     value: `${metrics.recall}%`,     cls: 'mc-amber', sub: 'Sensitivity' },
          { label: 'F1 Score',            value: `${metrics.f1_score}%`,   cls: 'mc-red',   sub: 'Harmonic mean' },
        ].map((m, i) => (
          <div key={i} className={`metric-card ${m.cls} fade-up`} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 28 }}>Dataset information</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Architecture',            value: 'PointNet',            sub: 'Segmentation variant' },
          { label: 'Total points evaluated',  value: metrics.total_points,  sub: 'Across test set' },
          { label: 'Output classes',          value: '50',                  sub: 'Tooth IDs + background' },
        ].map((m, i) => (
          <div key={i} className="metric-card fade-up" style={{ animationDelay: `${i * 0.07 + 0.28}s` }}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value" style={{ fontSize: 26, color: 'var(--text-1)', fontWeight: 300 }}>
              {m.value}
            </div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Topbar meta ──────────────────────────────────── */
  const topbarMeta = {
    diagnosis: { title: 'Scan Diagnosis', sub: 'Upload a 3D dental point cloud (.npz) and run AI segmentation' },
    metrics:   { title: 'Model Metrics',  sub: 'PointNet segmentation performance on the validation dataset' },
  };

  // ── Login gate ──
  if (!user) return <Login onLogin={handleLogin} />;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'Dr';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{topbarMeta[activeTab].title}</div>
            <div className="topbar-sub">{topbarMeta[activeTab].sub}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{user.name}</span>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--cyan-dim)', border: '1px solid rgba(0,119,204,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--cyan)',
            }}>{initials}</div>
          </div>
        </div>
        <div className="page-body">
          {activeTab === 'diagnosis' && <DiagnosisTab />}
          {activeTab === 'metrics'   && <MetricsTab />}
        </div>
      </div>
    </div>
  );
}


