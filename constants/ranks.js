const requireContext = require.context("../assets/ranks", false, /\.(png|jpe?g|svg)$/);
const ranks = requireContext.keys().reduce((images, path) => {
  const key = path.replace('./', '').replace(/\.(png|jpe?g|svg)$/, '');
  images[key] = requireContext(path);
  return images;
}, {});

export default { 
  ...ranks
};