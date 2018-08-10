FROM node:10-stretch

RUN apt-get update && apt-get upgrade -y

RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash
RUN apt-get install -y git-lfs

ADD run_inside.sh /run_inside.sh
RUN chmod +x /run_inside.sh
