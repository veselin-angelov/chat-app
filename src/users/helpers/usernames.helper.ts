const adjectives = ['cool', 'sunny', 'blue', 'quiet', 'fast'];
const animals = ['panda', 'fox', 'lion', 'wolf', 'mouse'];

export const generateUsername = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = animals[Math.floor(Math.random() * animals.length)];

  return `${adj}-${noun}`;
};
