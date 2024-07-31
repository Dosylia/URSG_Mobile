const requireContext = require.context("../assets/roles", false, /\.(png|jpe?g|svg)$/);
const roles = requireContext.keys().reduce((images, path) => {
  const key = path.replace('./', '').replace(/\.(png|jpe?g|svg)$/, '');
  images[key] = requireContext(path);
  return images;
}, {});

export default { 
  ...roles
};