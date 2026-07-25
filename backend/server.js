const { spawn } = require("child_process");
const { buffer } = require("stream/consumers");
const {WebSocketServer} = require("ws")

const child = spawn("./cuda_v2", []);
const server = new WebSocketServer(
  {port:8081}
)

let particles = [];
let chunks = [];
child.stdout.on("data",chunk=>{
  console.log("Received chunk:", chunk.length, "bytes");
  chunks.push(chunk);
})

child.stderr.on("data", chunk => {
  console.error("[CHILD STDERR]", chunk.toString());
});

child.on("error", error => {
  console.error("[SPAWN ERROR]", error);
});

child.on("close", (code, signal) => {
  console.log(`Child closed: code=${code}, signal=${signal}`);
  const buffer = Buffer.concat(chunks);
  particles= new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length / Float32Array.BYTES_PER_ELEMENT
  );
  particles.forEach(particle=>console.log("x , y : " ,particle))
  server.emit("particles",particles)
});


// input.writeFloatLE(value);

// console.log(input);

// child.stdin.write();
// child.stdin.end();


server.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message,isBinary) => {
      console.log("is binary: ",isBinary)

      const buffer = Buffer.from(message);
      child.stdin.write(message); 
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8081');