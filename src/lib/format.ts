const formatDateTime = (date: string): string => {
    if (!date) return 'N/A';
  
    const localDate = new Date(date);
    return localDate.toLocaleString();
};

export { formatDateTime }