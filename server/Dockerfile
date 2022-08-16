FROM node:latest
WORKDIR /home/mc/modelcollab/server
ENV HOME="/home/mc"

COPY ./package*.json ./
COPY ./database ../database/
COPY ./build ./build
COPY ./index.js .
COPY ./dotjulia /home/mc/.julia
COPY ./checkForDependencies.jl .

ADD https://julialang-s3.julialang.org/bin/linux/x64/1.7/julia-1.7.3-linux-x86_64.tar.gz julia-1.7.3-linux-x86_64.tar.gz
RUN tar -xvf julia-1.7.3-linux-x86_64.tar.gz
ENV PATH="${PATH}:/home/mc/modelcollab/server/julia-1.7.3/bin"
RUN julia checkForDependencies.jl

RUN npm install

EXPOSE 8080

CMD ["node", "index.js"]
