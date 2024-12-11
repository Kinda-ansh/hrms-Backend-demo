const ImageRule = {
  logo: {
    path: "assets/images/logoIcon",
    height: 2000,
    width: 2000,
    ext: [".jpg", ".jpeg", ".png"],
  },
  favicon: {
    path: "assets/images/favicon",
    height: 2000,
    width: 2000,
    ext: [".jpg", ".jpeg", ".png"],
  },
  extensions: {
    path: "assets/images/extensions",
    size: "36x36",
  },
  seo: {
    path: "assets/images/seo",
    size: "600x315",
  },
  notification: {
    path: "assets/images/notify",
    height: 2000,
    width: 2000,
    ext: [".jpg", ".jpeg", ".png", ".webp"],
  },

  user_profile: {
    path: "assets/images/user/profile",
    height: 2000,
    width: 2000,
    ext: [".jpg", ".jpeg", ".png"],
  },
  news_image: {
    path: "assets/images/news",
    height: 720,
    width: 1280,
    ext: [".jpg", ".jpeg", ".png", ".webp"],
  },
  blog_image: {
    path: "assets/images/blog",
    height: 720,
    width: 1280,
    ext: [".jpg", ".jpeg", ".webp"],
  },
  brand: {
    brand_image: {
      path: "assets/images/brand/image",
      height: 2000,
      width: 2000,
      ext: [".jpg", ".jpeg", ".png", ".svg", ".webp"],
    },
    brand_logo: {
      path: "assets/images/brand/logo",
      height: 2000,
      width: 2000,
      ext: [".jpg", ".jpeg", ".png", ".svg", ".webp"],
    },
  },
  banner: {
    path: "assets/images/banner",
    height: 360,
    width: 640,
    ext: [".jpg", ".jpeg", ".png", ".svg", ".webp"],
  },
};

module.exports = {
  ImageRule,
};
