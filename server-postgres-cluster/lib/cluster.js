import cluster from "cluster";
import { createServer } from "http";
import { setupMaster } from "@socket.io/sticky";
import { cpus } from "os";

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  const httpServer = createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  httpServer.listen(3000);

  // Only run one worker for now to debug
  cluster.fork();

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  try {
    // Import and run the main application
    console.log('Importing index.js...');
    const { main } = await import("./index.js");
    console.log('Main function imported, calling it...');
    await main();
    console.log('Main function completed');
  } catch (error) {
    console.error('Error in worker:', error);
  }
}
