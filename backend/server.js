const { spawn } = require("child_process");
const { buffer } = require("stream/consumers");

const child = spawn("./cuda_v2", ["1000"]);


let particles = [];
child.stdout.on("data",chunk=>{
  console.log("chunk:  ",chunk)
//  const buffer = Buffer.concat(chunk);
const buffer = chunk;
  const floats = new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length / Float32Array.BYTES_PER_ELEMENT
  );


  for (let i=0;i<floats.length/10;i++){
    console.log(
      "{"
      ,floats[10*i]," ",floats[10*i+1]," ",floats[10*i+2],"}"
      );
  }
})

child.stderr.on("data", chunk => {
  console.error("CUDA log:", chunk.toString());
});