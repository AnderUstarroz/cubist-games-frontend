#!/bin/bash
# On Vercel -> settings -> git: bash scripts/ignore-vercel-preview.sh
echo "VERCEL_ENV: $VERCEL_ENV"
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ ("$VERCEL_GIT_COMMIT_REF" == "production" && "$VERCEL_ENV" == "production") || ("$VERCEL_GIT_COMMIT_REF" == "testing" && "$VERCEL_ENV" == "testing") ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi
