#!/bin/bash

echo "🔑 Logging into GHCR..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

echo "📥 Pulling image $IMAGE..."
docker pull "$IMAGE"

echo "🔎 Verifying image..."
docker images "$IMAGE" --digests

echo "✅ Pre-pull complete on $(hostname)"