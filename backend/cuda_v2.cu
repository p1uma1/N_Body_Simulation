#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>

#define INPUT_SIZE 1000
#define N 1000
#define NUM_THREADS 1024

const int iterations = (N + NUM_THREADS - 1) / NUM_THREADS; // ceil

int threadsPerBlock = 32;
int blocksPerGrid =
    (NUM_THREADS + threadsPerBlock - 1) / threadsPerBlock;

const float G = 6.674e-11f;
const float EPS = 1e-9f;

struct Particle
{
    float x, y, z;    // Position
    float vx, vy, vz; // Velocity
    float ax, ay, az; // Acceleration
    float mass;       // Mass
};

struct Arg
{
    float G;
    float EPS;
    struct Particle *particles;
};

struct Particle particles[N];

void load_input(struct Particle particles[], int n, const char *filename)
{
    struct Particle base[INPUT_SIZE];

    FILE *file = fopen(filename, "r");
    if (file == NULL)
    {
        perror("Error opening file");
        exit(1);
    }

    char line[256];
    fgets(line, sizeof(line), file); // skip header

    for (int i = 0; i < INPUT_SIZE; i++)
    {
        if (fgets(line, sizeof(line), file) == NULL)
        {
            printf("File ended early at line %d\n", i);
            exit(1);
        }

        int result = sscanf(line, "%f,%f,%f,%f,%f,%f,%f",
                            &base[i].x,
                            &base[i].y,
                            &base[i].z,
                            &base[i].vx,
                            &base[i].vy,
                            &base[i].vz,
                            &base[i].mass);

        if (result != 7)
        {
            printf("Invalid CSV format at line %d\n", i);
            exit(1);
        }

        base[i].ax = base[i].ay = base[i].az = 0.0f;
    }

    fclose(file);

    // Repeat the 1000 input particles if N is larger
    for (int i = 0; i < n; i++)
    {
        particles[i] = base[i % INPUT_SIZE];

        particles[i].ax = 0.0f;
        particles[i].ay = 0.0f;
        particles[i].az = 0.0f;
    }
}
void save_results(struct Particle particles[], int n, const char *filename)
{
    FILE *file = fopen(filename, "w");

    if (file == NULL)
    {
        printf("Error opening output file\n");
        return;
    }

    fprintf(file, "ax,ay,az\n");

    for (int i = 0; i < n; i++)
    {
        fprintf(file, "%e,%e,%e\n",
                particles[i].ax,
                particles[i].ay,
                particles[i].az);
    }

    fclose(file);
}

void save_time(double time, int n, const char *filename)
{
    FILE *file = fopen(filename, "a");

    if (file == NULL)
    {
        printf("Error opening output file\n");
        return;
    }

    fprintf(file, "%d,%e\n",
            n, time);

    fclose(file);
}

__global__ void compute_forces(struct Arg p, int num_particles)
{
    int tid = blockIdx.x * blockDim.x+ threadIdx.x;

    if(tid>=num_particles)
        return;

    struct Particle *particles = p.particles;
    float G_d = p.G;
    float EPS_d = p.EPS;

    int offset = tid * iterations;

    for (int i = offset;  i < offset + iterations && i < num_particles; i++)
    {
        float acc_x = 0, acc_y = 0, acc_z = 0;
        for (int j = 0; j < N; j++)
        {
            if (i == j)
                continue;
            float dx = particles[j].x - particles[i].x;
            float dy = particles[j].y - particles[i].y;
            float dz = particles[j].z - particles[i].z;

            float distSq = dx * dx + dy * dy + dz * dz + EPS_d;
            float distInv = rsqrtf(distSq);
            float distInv3 = distInv * distInv * distInv;

            float s = particles[j].mass * distInv3;
            acc_x += dx * s;
            acc_y += dy * s;
            acc_z += dz * s;
        }

        particles[i].ax = G_d * acc_x;
        particles[i].ay = G_d * acc_y;
        particles[i].az = G_d * acc_z;
        // printf("acce_x for particle %d is %e\n",i,particles[i].ax);
    }
}

int main()
{

    struct Particle *d_particles;
    struct Arg argument;

    argument.G = G;
    argument.EPS = EPS;

    load_input(particles, N, "../input_1000.csv");


    // change the value of d_particles pointer to a address of gpu
    cudaMalloc((void **)&d_particles, N * sizeof(Particle));

    argument.particles = d_particles;

    cudaMemcpy(d_particles, particles, N * sizeof(Particle), cudaMemcpyHostToDevice);

    compute_forces<<<blocksPerGrid, threadsPerBlock>>>(argument,N);



    // Wait until GPU finishes
    cudaDeviceSynchronize();


    cudaMemcpy(particles, d_particles, N * sizeof(Particle), cudaMemcpyDeviceToHost);
    fwrite(particles,sizeof(Particle),N,stdout);

    return 0;
}

// nvcc cuda_v2.cu -o cuda_v2 -lm
//./cuda_v2