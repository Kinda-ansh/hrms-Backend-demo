const HeaderKey = (req, res, next) => {
  const host = req.headers['x-spj-host'];
  const key = req.headers['x-spj-key'];

  if (host !== process.env.HOST || key !== process.env.KEY) {
      return res.status(403).json({ message: "please pass headers to use this route" });
  }

  next();
};

module.exports = HeaderKey;