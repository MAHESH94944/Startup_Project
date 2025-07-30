function isStrongPassword(password) {
  // Minimum 6 chars, at least one uppercase, one lowercase, one digit, one special char
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return regex.test(password);
}

module.exports = { isStrongPassword };
