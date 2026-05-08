const logger = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = {
  logger,
  errorHandler
};
