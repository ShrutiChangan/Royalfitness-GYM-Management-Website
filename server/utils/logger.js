const log = (type, message, data = null) => {
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}] [${type}] ${message}`,
    data ? JSON.stringify(data, null, 2) : ""
  );
};

module.exports = {
  info: (msg, data) => log("INFO", msg, data),
  success: (msg, data) => log("SUCCESS", msg, data),
  ml: (msg, data) => log("ML", msg, data),
  fallback: (msg, data) => log("FALLBACK", msg, data),
};