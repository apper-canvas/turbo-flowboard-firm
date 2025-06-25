import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const FileUpload = ({ taskId, onFileAttached, onFileRemoved, existingFiles = [], className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
          toast.error(`File type ${file.type} is not supported.`);
          continue;
        }

        await onFileAttached(file);
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [onFileAttached]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 10
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'Image';
    if (type === 'application/pdf') return 'FileText';
    if (type.includes('word')) return 'FileText';
    if (type.includes('excel') || type.includes('sheet')) return 'Table';
    return 'File';
  };

  const isImage = (type) => type.startsWith('image/');

  const handleRemoveFile = async (fileId) => {
    try {
      await onFileRemoved(fileId);
      toast.success('File removed successfully');
    } catch (error) {
      toast.error('Failed to remove file');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-surface-300 hover:border-primary/50 hover:bg-surface-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
            isDragActive ? 'bg-primary text-white' : 'bg-surface-100 text-surface-500'
          }`}>
            <ApperIcon name="Upload" size={24} />
          </div>
          
          <div>
            <p className="font-medium text-surface-900">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-surface-500 mt-1">
              or <span className="text-primary">browse files</span>
            </p>
            <p className="text-xs text-surface-400 mt-2">
              Supports: Images, PDF, Word, Excel (max 10MB each)
            </p>
          </div>
        </motion.div>
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-surface-900 text-sm">
            Attached Files ({existingFiles.length})
          </h5>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {existingFiles.map((file) => (
                <motion.div
                  key={file.Id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="border border-surface-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* File Preview/Icon */}
                    <div className="flex-shrink-0">
                      {isImage(file.type) && file.url ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded border border-surface-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-surface-100 rounded flex items-center justify-center">
                          <ApperIcon name={getFileIcon(file.type)} size={16} className="text-surface-500" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-surface-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="X"
                      onClick={() => handleRemoveFile(file.Id)}
                      className="text-surface-400 hover:text-error p-1"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-surface-600"
        >
          <div className="animate-spin">
            <ApperIcon name="Loader2" size={16} />
          </div>
          Uploading files...
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;