const { exec } = require("child_process");

// Run Prisma Migrate
exec("npx prisma migrate deploy", (err, stdout, stderr) => {
  if (err) {
    console.error(`Error running migration: ${stderr}`);
    process.exit(1);
  }
  console.log(stdout);
});
