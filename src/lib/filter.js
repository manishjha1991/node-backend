export const filterFields = (toFilter, allowedFields) => {
  return allowedFields.reduce((memo, field) => {
    return { ...memo, [field]: toFilter[field] };
  }, {});
};
