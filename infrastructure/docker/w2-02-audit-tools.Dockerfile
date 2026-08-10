FROM eclipse-temurin:21-jre

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ripgrep \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/bin/bash"]
