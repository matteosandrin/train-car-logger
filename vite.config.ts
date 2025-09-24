import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const fallbackBasePath = '/train-car-logger/';

const getBasePath = () => {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return fallbackBasePath;

  const [, repoName] = repository.split('/');
  if (!repoName) return fallbackBasePath;

  return `/${repoName}/`;
};

const repoBasePath = getBasePath();

export default defineConfig(({ command }) => ({
  base: command === 'build' ? repoBasePath : '/',
  plugins: [react()],
}));
