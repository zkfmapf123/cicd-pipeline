push:
	@git add .
	@git commit -m "jenkins-test"
	@git push origin master

test:
	@docker build -f deploy/Dockerfile.test -t node:test .
	@docker run -it --name test_container node:test