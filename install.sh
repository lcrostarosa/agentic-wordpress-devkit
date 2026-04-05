#!/bin/bash

MARKETPLACE="agentic-wordpress-devkit"
SCOPE="${1:-project}"

echo "Adding agentic-wordpress-devkit marketplace..."
claude plugin marketplace add lcrostarosa/agentic-wordpress-devkit

echo "Installing shared agents..."
claude plugin install agents@$MARKETPLACE --scope $SCOPE

echo "Installing skills..."
claude plugin install wordpress-design@$MARKETPLACE --scope $SCOPE
claude plugin install wordpress-security@$MARKETPLACE --scope $SCOPE
claude plugin install wordpress-issue-debug@$MARKETPLACE --scope $SCOPE
claude plugin install market-seo-audit@$MARKETPLACE --scope $SCOPE
claude plugin install local-business-site-audit@$MARKETPLACE --scope $SCOPE
claude plugin install market-seo-schema-markup@$MARKETPLACE --scope $SCOPE
claude plugin install content-blog-optimize@$MARKETPLACE --scope $SCOPE
claude plugin install marketing-copywriting@$MARKETPLACE --scope $SCOPE
claude plugin install content-refine@$MARKETPLACE --scope $SCOPE
claude plugin install marketing-page-cro@$MARKETPLACE --scope $SCOPE
claude plugin install marketing-email-sequence@$MARKETPLACE --scope $SCOPE
claude plugin install market-competitor-alternatives@$MARKETPLACE --scope $SCOPE
claude plugin install marketing-lead-magnets@$MARKETPLACE --scope $SCOPE
claude plugin install marketing-launch-strategy@$MARKETPLACE --scope $SCOPE
claude plugin install marketing-experimentation@$MARKETPLACE --scope $SCOPE
claude plugin install content-strategy@$MARKETPLACE --scope $SCOPE
claude plugin install content-blog-write@$MARKETPLACE --scope $SCOPE
claude plugin install market-customer-research@$MARKETPLACE --scope $SCOPE
claude plugin install market-competitor-research@$MARKETPLACE --scope $SCOPE
claude plugin install chatbot-creator@$MARKETPLACE --scope $SCOPE
claude plugin install skill-builder@$MARKETPLACE --scope $SCOPE

echo "Done. All 22 plugins installed (scope: $SCOPE)."
