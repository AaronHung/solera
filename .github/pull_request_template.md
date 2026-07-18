# Pull Request

## Related requirement / backlog item

<!-- Link to requirement ID, ADR, or backlog item -->
Closes #

## Summary

<!-- What problem does this PR solve and how? -->

## Changes

- 
- 

## Verification

<!-- Confirm the following before requesting review -->

- [ ] `npm run verify` passes (JS build / typecheck / tests + Python lint + tests + browser smoke)
- [ ] No new write or control tools added to the Agent Tool Registry
- [ ] All new analytical values are produced by deterministic analytics with Evidence attached
- [ ] Any new Widget type is added to the allowlist in `packages/contracts/schema/solera.schema.json`
- [ ] `docs/PROJECT_STATE.md` updated if gate or verified items changed
- [ ] Corresponding requirement ID or ADR referenced in commit message(s)

## Security checklist

- [ ] No host-page cookies, auth headers, or passwords accessed
- [ ] No CSP weakening (`unsafe-eval`, `unsafe-inline`, `<all_urls>`)
- [ ] No arbitrary HTML/JS produced by the model
- [ ] No raw PI data sent to frontier model without policy approval
