export const getAuthHeader = () => {
  const storedUser = localStorage.getItem('authUser');

  if (!storedUser) {
    return {};
  }

  const user = JSON.parse(storedUser);

  return {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
};