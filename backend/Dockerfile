# Stage 1: Build Dart deps
FROM dart:stable AS dart-deps
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN dart pub get --offline || dart pub get

# Stage 2: Runtime image with Python and Dart
FROM python:3.11-slim AS runtime

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy Dart SDK from the dart-deps stage (which is based on dart:stable)
COPY --from=dart-deps /usr/lib/dart /usr/lib/dart
ENV PATH="/usr/lib/dart/bin:${PATH}"

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
