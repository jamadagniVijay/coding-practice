````Common Commands:
  run         Create and run a new container from an image
			  Run a container using the image name nginx:1.28-alpine (not the image ID) and name it webapp.
				 > docker run --name webapp nginx:1.28-alpine
  ps          List containers : docker ps -a -> includes containers not running
  images      List images
  exec        Execute a command in a running container
  build       Build an image from a Dockerfile
  bake        Build from a file
  pull        Download an image from a registry
  push        Upload an image to a registry
  login       Authenticate to a registry
  logout      Log out from a registry
  search      Search Docker Hub for images
  version     Show the Docker version information
  info        Display system-wide information

Management Commands:
  image       Manage images
			  Cleanup: Delete all images on the host.
				> docker image rm -f $(docker images -q)
  builder     Manage builds
  buildx*     Docker Buildx
  compose*    Docker Compose
  container   Manage containers
  context     Manage contexts
  manifest    Manage Docker image manifests and manifest lists
  network     Manage networks
  plugin      Manage plugins
  system      Manage Docker
  volume      Manage volumes

Swarm Commands:
  swarm       Manage Swarm

Commands:
  attach      Attach local standard input, output, and error streams to a running container
  commit      Create a new image from a container's changes
  cp          Copy files/folders between a container and the local filesystem
  create      Create a new container
  diff        Inspect changes to files or directories on a container's filesystem
  events      Get real time events from the server
  export      Export a container's filesystem as a tar archive
  history     Show the history of an image
  import      Import the contents from a tarball to create a filesystem image
  inspect     Return low-level information on Docker objects
  kill        Kill one or more running containers
  load        Load an image from a tar archive or STDIN
  logs        Fetch the logs of a container
  pause       Pause all processes within one or more containers
  port        List port mappings or a specific mapping for the container
  rename      Rename a container
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images
  save        Save one or more images to a tar archive (streamed to STDOUT by default)
  start       Start one or more stopped containers
  stats       Display a live stream of container(s) resource usage statistics
  stop        Stop one or more running containers
  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE
  top         Display the running processes of a container
  unpause     Unpause all processes within one or more containers
  update      Update configuration of one or more containers
  wait        Block until one or more containers stop, then print their exit codes

List containers
Usage:  docker ps [OPTIONS]

Aliases:
  docker container ls, docker container list, docker container ps, docker ps
	Run an instance of kodekloud/simple-webapp:blue and name the container blue-app. Map host port 38282 to port 8080 inside the container.
		> docker run --name "blue-app" -d -p 38282:8080 kodekloud/simple-webapp:blue
		````
		In your Docker command, **`-d` runs the container in the background**, and **`-p` maps a network port** so you can access the app from your browser. 

	### Flag Breakdown

	* **`-d` (Detached Mode).** This tells Docker to run the container in the background and print only the container ID to your terminal. Without `-d`, the container runs in the foreground, locking your terminal window to the app's live logs until you stop it.
	* **`-p 38282:8080` (Port Publishing).** This connects a port on your host machine to a port inside the isolated Docker container using the format `HOST_PORT:CONTAINER_PORT`. 
	  * **`38282` (Host Port).** This is the port exposed on your computer or server that you type into your browser (`http://localhost:38282`).
	  * **`8080` (Container Port).** This is the internal port where the `simple-webapp` application is actually listening for traffic inside the container.

	### How the Full Command Works Together

	When you execute `docker run --name blue-app -d -p 38282:8080 kodekloud/simple-webapp:blue`, Docker performs four actions:
	1. Pulls the `kodekloud/simple-webapp:blue` image if it is not already downloaded locally.
	2. Assigns the friendly name `blue-app` to the container for easy management.
	3. Starts the container silently in the background (`-d`).
	4. Routes any incoming web traffic hitting port `38282` on your machine directly to port `8080` inside the `blue-app` container (`-p`).
````
Options:
  -a, --all             Show all containers (default shows just running)
  -f, --filter filter   Filter output based on conditions provided
      --format string   Format output using a custom template:
                        'table':            Print output in table format
                        with column headers (default)
                        'table TEMPLATE':   Print output in table format
                        using the given Go template
                        'json':             Print in JSON format
                        'TEMPLATE':         Print output using the given
                        Go template.
                        Refer to https://docs.docker.com/go/formatting/
                        for more information about formatting output with
                        templates
  -n, --last int        Show n last created containers (includes all
                        states) (default -1)
  -l, --latest          Show the latest created container (includes all
                        states)
      --no-trunc        Don't truncate output
  -q, --quiet           Only display container IDs
  -s, --size            Display total file sizes
PS C:\Users\anany>


Global Options:
      --config string      Location of client config files (default "/root/.docker")
  -c, --context string     Name of the context to use to connect to the daemon
                           (overrides DOCKER_HOST env var and default context set with
                           "docker context use")
  -D, --debug              Enable debug mode
  -H, --host string        Daemon socket to connect to
  -l, --log-level string   Set the logging level ("debug", "info", "warn", "error",
                           "fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default
                           "/root/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default "/root/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default "/root/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit
````