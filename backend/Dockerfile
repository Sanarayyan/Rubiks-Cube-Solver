# Multi-stage: build Dart deps, then run with Python

FROM dart:stable AS dart-deps
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN dart pub get --offline || dart pub get

FROM python:3.11-slim AS runtime
# Install minimal tools for Dart runtime
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates unzip && rm -rf /var/lib/apt/lists/*

# Install Dart SDK (stable)
RUN curl -fsSL https://storage.googleapis.com/dart-archive/channels/stable/release/latest/linux_packages/dart_amd64.deb -o /tmp/dart.deb \
  && apt-get update && apt-get install -y /tmp/dart.deb && rm -f /tmp/dart.deb

WORKDIR /app

# Copy Python deps and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Dart source and solver
COPY lib ./lib
COPY solver.py ./solver.py
COPY pubspec.yaml pubspec.lock ./

# Get Dart deps at runtime layer too (ensures lock alignment)
RUN dart pub get --offline || dart pub get

ENV PORT=8081
EXPOSE 8081

CMD ["dart", "run", "lib/main.dart"]
