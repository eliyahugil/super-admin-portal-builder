
export const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'contract';
    case 'doc':
    case 'docx':
      return 'form';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'id';
    default:
      return 'other';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'signed':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'ממתין לחתימה';
    case 'signed':
      return 'נחתם';
    case 'rejected':
      return 'נדחה';
    default:
      return status;
  }
};

export const getDocumentTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'contract':
      return 'bg-blue-100 text-blue-800';
    case 'id':
      return 'bg-green-100 text-green-800';
    case 'certificate':
      return 'bg-purple-100 text-purple-800';
    case 'form':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDocumentTypeLabel = (type: string) => {
  switch (type.toLowerCase()) {
    case 'contract':
      return 'חוזה';
    case 'id':
      return 'תעודת זהות';
    case 'certificate':
      return 'תעודה';
    case 'form':
      return 'טופס';
    default:
      return type;
  }
};
