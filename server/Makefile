push:
	@git add .
	@git commit -m "wip"
	@git push origin master

image:
	@docker build -f ./deploy/Dockerfile -t node:test .

sh-run:
	@docker run -it node:test /bin/bash

prune:
	docker rmi $(docker images -f "dangling=true" -q) 
	@docker image prune