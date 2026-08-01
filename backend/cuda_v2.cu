#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>
#include <chrono>
#define INPUT_SIZE 1000
#define N 1000
#define NUM_THREADS 1024

#define MASS_SCALE 1e18;
#define POSITION_SCALE 1e6;
#define VELOCITY_SCALE 5e3;

using Clock = std::chrono::steady_clock;

const int iterations = (N + NUM_THREADS - 1) / NUM_THREADS; // ceil

int threadsPerBlock = 32;
int blocksPerGrid =
    (NUM_THREADS + threadsPerBlock - 1) / threadsPerBlock;

const float G = 6.674e-11f;
const float EPS = 1e-9f;



struct Particle
{
    float mass, radius;
    float x, y, z;    // Position
    float vx, vy, vz; // Velocity
    float ax, ay, az; // Acceleration
                      // Mass
};

struct Arg
{
    float G;
    float EPS;
    struct Particle *particles;
};

struct Particle particles[N];

__global__ void compute_forces(struct Arg p, int num_particles)
{
    int tid = blockIdx.x * blockDim.x + threadIdx.x;

    if (tid >= num_particles)
        return;

    struct Particle *particles = p.particles;
    float G_d = p.G;
    float EPS_d = p.EPS;

    int offset = tid * iterations;

    for (int i = offset; i < offset + iterations && i < num_particles; i++)
    {
        float acc_x = 0, acc_y = 0, acc_z = 0;
        for (int j = 0; j < N; j++)
        {
            if (i == j)
                continue;
            float dx = (particles[j].x - particles[i].x);
            float dy = particles[j].y - particles[i].y;
            float dz = particles[j].z - particles[i].z;

            float distSq = dx * dx + dy * dy + dz * dz + EPS_d;  
            float distInv = rsqrtf(distSq);
            float distInv3 = distInv * distInv * distInv;  //GM/R^2 * x/[x] = GM/R^3 vector for each direction

            float s = particles[j].mass * distInv3;

            //1e6 = MASS_SCALE/POSITION_SCALE^2 ; this will produce the values in SI measurements (ms^-2)
            acc_x += dx * s * 1e6;  
            acc_y += dy * s * 1e6;
            acc_z += dz * s * 1e6;
        }

        //scale back to three js
        particles[i].ax = G_d * acc_x * 1e-6;
        particles[i].ay = G_d * acc_y * 1e-6;
        particles[i].az = G_d * acc_z * 1e-6;

    }
}

__global__ void update_vectors(struct Particle *particles, int num_particles, double interval)
{
    int tid = blockIdx.x * blockDim.x + threadIdx.x;

    if (tid >= num_particles)
        return;

    particles[tid].vx += particles[tid].ax * interval;// acc_x * dt
    particles[tid].vy += particles[tid].ay * interval;
    particles[tid].vz += particles[tid].az * interval;
    particles[tid].x += particles[tid].vx * interval;
    particles[tid].y += particles[tid].vy * interval;
    particles[tid].z += particles[tid].vz * interval;
}

int main()
{

    struct Particle *d_particles;
    struct Arg argument;

    argument.G = G;
    argument.EPS = EPS;

    size_t totalRead = 0;

    // initially read the particles
    while (totalRead < N)
    {
        size_t count = fread(
            particles + totalRead,
            sizeof(struct Particle),
            N - totalRead,
            stdin);

        if (count == 0)
        {
            if (feof(stdin))
            {
                fprintf(stderr,
                        "Unexpected EOF: received %zu of %d particles\n",
                        totalRead,
                        N);
            }
            else if (ferror(stdin))
            {
                perror("Failed to read particles");
            }

            return EXIT_FAILURE;
        }

        totalRead += count;
    }

    // change the value of d_particles pointer to a address of gpu
    cudaMalloc((void **)&d_particles, N * sizeof(Particle));

    argument.particles = d_particles;

    cudaMemcpy(d_particles, particles, N * sizeof(Particle), cudaMemcpyHostToDevice);

    compute_forces<<<blocksPerGrid, threadsPerBlock>>>(argument, N);

    // Wait until GPU finishes
    cudaDeviceSynchronize();

    cudaMemcpy(particles, d_particles, N * sizeof(Particle), cudaMemcpyDeviceToHost);
    const auto outputInterval =
        std::chrono::duration_cast<Clock::duration>(
            std::chrono::duration<double>(1.0 / 60.0));
            
    float interval =
    std::chrono::duration<float>(outputInterval).count();

    update_vectors<<<blocksPerGrid,threadsPerBlock>>> (d_particles,N,interval);
    fwrite(particles, sizeof(Particle), N, stdout);

    

    auto nextOutputTime = Clock::now() + outputInterval;

    // repeat
    while (true)
    {
        compute_forces<<<blocksPerGrid, threadsPerBlock>>>(argument, N);
        cudaDeviceSynchronize();

        update_vectors<<<blocksPerGrid,threadsPerBlock>>> (d_particles,N,interval);
        const auto now = Clock::now();

        if (now >= nextOutputTime)

        {

            
            cudaMemcpy(particles, d_particles, N * sizeof(Particle), cudaMemcpyDeviceToHost);
            fwrite(particles, sizeof(Particle), N, stdout);
            fflush(stdout);
            nextOutputTime += outputInterval;

            const auto afterOutputTime = Clock::now();
            // if the time spent is more than intervalwe have to skip frame/frames
            while (nextOutputTime < afterOutputTime)
            {
                nextOutputTime += outputInterval;
            }
        }
    }

    return 0;
}

// nvcc cuda_v2.cu -o cuda_v2 -lm
//./cuda_v2