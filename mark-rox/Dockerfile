FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node . .
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
USER node
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node","--env-file-if-exists=.env","server.mjs"]
