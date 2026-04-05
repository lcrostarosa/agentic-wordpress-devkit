#!/bin/bash

MARKETPLACE="agentic-wordpress-devkit"
SCOPE="${1:-project}"
FAILED=0
INSTALLED=0

install_plugin() {
  local name="$1"
  if claude plugin install "${name}@${MARKETPLACE}" --scope "$SCOPE" 2>&1; then
    INSTALLED=$((INSTALLED + 1))
  else
    FAILED=$((FAILED + 1))
  fi
}

echo "Adding agentic-wordpress-devkit marketplace..."
# Remove old marketplace name if migrating from a previous install
claude plugin marketplace remove wordpress-design-skills 2>/dev/null && echo "Removed old marketplace registration" || true
claude plugin marketplace add lcrostarosa/agentic-wordpress-devkit

echo "Installing shared agents..."
install_plugin agents

echo "Installing skills..."
install_plugin wordpress-design
install_plugin wordpress-security
install_plugin wordpress-issue-debug
install_plugin market-seo-audit
install_plugin local-business-site-audit
install_plugin market-seo-schema-markup
install_plugin marketing-copywriting
install_plugin content-refine
install_plugin marketing-page-cro
install_plugin marketing-email-sequence
install_plugin market-competitor-alternatives
install_plugin marketing-lead-magnets
install_plugin marketing-launch-strategy
install_plugin marketing-experimentation
install_plugin content-strategy
install_plugin market-customer-research
install_plugin market-competitor-research
install_plugin chatbot-creator
install_plugin skill-builder

echo "Installing blog skills..."
install_plugin blog
install_plugin blog-analyze
install_plugin blog-audio
install_plugin blog-audit
install_plugin blog-brief
install_plugin blog-calendar
install_plugin blog-cannibalization
install_plugin blog-chart
install_plugin blog-factcheck
install_plugin blog-geo
install_plugin blog-google
install_plugin blog-image
install_plugin blog-notebooklm
install_plugin blog-outline
install_plugin blog-persona
install_plugin blog-repurpose
install_plugin blog-rewrite
install_plugin blog-schema
install_plugin blog-seo-check
install_plugin blog-strategy
install_plugin blog-taxonomy
install_plugin blog-write

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "Done. All $INSTALLED plugins installed (scope: $SCOPE)."
else
  echo "Done. $INSTALLED installed, $FAILED failed (scope: $SCOPE)."
  exit 1
fi
