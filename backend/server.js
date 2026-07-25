const { spawn } = require("child_process");
const { buffer } = require("stream/consumers");
const { WebSocketServer } = require("ws")


const server = new WebSocketServer(
  { port: 8081 }
)


numParticles = 1000;






server.on('connection', (socket) => {
  let particles = [];
  let chunks = [];
  let chunkLength = 0;
  console.log('Client connected');
  const child = spawn("./cuda_v2", []);

  socket.on('message', (message, isBinary) => {
    console.log("is binary: ", isBinary)

    const buffer = Buffer.from(message);
    child.stdin.write(message);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
  child.stderr.on("data", chunk => {
    console.error("[CHILD STDERR]", chunk.toString());
  });

  child.on("error", error => {
    console.error("[SPAWN ERROR]", error);
  });

  child.on("close", (code, signal) => {
    console.log(`Child closed: code=${code}, signal=${signal}`);
    const buffer = Buffer.concat(chunks);
    particles = new Float32Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.length / Float32Array.BYTES_PER_ELEMENT
    );
    socket.send(buffer)
  });
  child.stdout.on("data", chunk => {
    chunkLength += chunk.length
    chunks.push(chunk);
    if (chunkLength >= numParticles * 4 * 11) {
      console.log("chunks full")
    }
    server.emit()
  })
});

console.log('WebSocket server is running on ws://localhost:8081');