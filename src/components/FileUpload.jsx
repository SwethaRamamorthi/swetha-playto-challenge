import React, { useState, useRef } from 'react';
import { UploadCloud, X, File, AlertCircle } from 'lucide-react';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const FileUpload = ({ label, onFilesUpdate }) => {
   const [files, setFiles] = useState([]);
   const [error, setError] = useState('');
   const fileInputRef = useRef(null);

   const validateFile = (file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
         return 'Invalid file type. Only PDF, JPG, and PNG are allowed.';
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
         return `File is too large. Max size is ${MAX_SIZE_MB}MB.`;
      }
      return null;
   };

   const handleFiles = (newFiles) => {
      setError('');
      const validFiles = [];
      
      for(let f of Array.from(newFiles)) {
         const validationError = validateFile(f);
         if(validationError) {
            setError(validationError);
            return;
         }
         validFiles.push(f);
      }
      
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      if(onFilesUpdate) onFilesUpdate(updatedFiles);
   };

   const onDrop = (e) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
   };

   const removeFile = (index) => {
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      if(onFilesUpdate) onFilesUpdate(updated);
   };

   return (
      <div className="w-full">
         <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
         
         <div 
           className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors bg-slate-50 border-slate-300 hover:border-brand-500 hover:bg-brand-50 cursor-pointer`}
           onDragOver={(e) => e.preventDefault()}
           onDrop={onDrop}
           onClick={() => fileInputRef.current?.click()}
         >
            <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-sm font-medium text-slate-700 text-center">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500 mt-1">PDF, JPG or PNG (MAX {MAX_SIZE_MB}MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={(e) => handleFiles(e.target.files)} 
              accept=".pdf,.jpg,.jpeg,.png"
            />
         </div>

         {error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
               <AlertCircle className="w-4 h-4 mr-1" />
               {error}
            </div>
         )}

         {files.length > 0 && (
            <ul className="mt-4 space-y-2">
               {files.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                     <div className="flex items-center text-sm text-slate-700">
                        <File className="w-4 h-4 mr-2 text-brand-500" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-slate-400 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                     </div>
                     <button type="button" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                     </button>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
};

export default FileUpload;
