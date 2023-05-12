import { zip } from 'zip-a-folder';

zip('./dist', 'dist.zip')
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    process.exit(1);
  });
