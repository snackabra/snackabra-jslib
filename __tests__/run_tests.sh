# we just generate clean JS for reference
tsc -t es6 --strict ./main.01.ts
tsc -t es6 --strict ./main.02.ts
# run tests with coverage
deno test --coverage=profile ./deno.01.ts && deno coverage profile --include=main.01.ts
deno test --coverage=profile ./deno.02.ts && deno coverage profile --include=main.02.ts

echo
echo "###########################################################################"
echo "NOTE - you sometimes need to clear contents of profile directory and re-run"
echo "###########################################################################"
echo

# this generates current errors left in main
# tsc -t es6 --strict --remove-comments ./main.ts
