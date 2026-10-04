#!/usr/bin/env bash
# Exports brand assets from the Baeleys Figma file into public/assets.
# Usage: FIGMA_TOKEN=<personal access token> ./scripts/export-figma-assets.sh
# Token: Figma > Settings > Security > Personal access tokens (read-only file scope is enough).
#
# Only product, packaging and character art is listed. The file also holds
# ID scans, KYC, agreements, invoices and dealer pricing; those are left out on purpose.
set -euo pipefail

: "${FIGMA_TOKEN:?Set FIGMA_TOKEN to a Figma personal access token}"
FILE=HYLokr4vo4vzgyyfHHtFSO
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/assets"
command -v jq >/dev/null || { echo "jq is required"; exit 1; }

# dir|format|scale|nodeId|filename
ASSETS=$(cat <<'EOF'
products|png|1|504:14584|butterscotch-cone
products|png|1|504:14585|chocolate-cone
products|png|1|504:14586|vanilla-cone
products|png|2|504:14587|scoop-pistachio
products|png|2|504:14588|scoop-mango
products|png|2|504:14589|scoop-vanilla
products|png|2|504:14590|scoop-black-currant
products|png|2|504:14591|scoop-strawberry
products|png|2|504:14592|scoop-21st-love
products|png|2|504:14593|scoop-chocolate
products|png|2|504:14594|scoop-butterscotch
products|png|2|504:14595|scoop-blueberry
products|png|2|504:14596|scoop-main
products|png|1|504:9900|kulfi-taro
products|png|1|504:10300|kulfi-strawberry
products|png|1|504:10692|kulfi-mango
products|png|1|504:11096|kulfi-blueberry
products|png|1|504:11496|kulfi-honeydew
products|png|1|504:11896|kulfi-coffee
products|png|1|504:12288|kulfi-chocolate
products|png|1|504:15705|milky-bar
products|png|1|504:12758|blissberry-kulfi-blueberry
products|png|1|504:12759|blissberry-kulfi-taro
products|png|1|504:12760|blissberry-kulfi-mango
products|png|1|504:12761|blissberry-kulfi-honeydew
products|png|1|504:13416|mini-chocobar
products|png|1|504:13667|oreo
products|png|1|504:13746|oreo-2
products|png|1|504:15502|chocobar
products|png|1|504:15957|chocobar-wrapper
products|png|1|504:15601|nutty-crunch
products|png|1|504:15810|baeleys-ice-cream-1
products|png|1|504:15811|baeleys-ice-cream-2
products|png|1|504:15812|baeleys-ice-cream-3
products|png|1|504:15813|cup-butterscotch
products|png|1|504:15885|cup-chocolate
products|png|1|504:15958|cup-21-love
products|png|1|504:15495|popsicle-oreo
products|png|1|504:15496|popsicle-coco-crunch
products|png|1|504:15497|popsicle-3
products|png|1|504:15498|popsicle-4
products|png|1|504:15499|popsicle-5
products|png|1|504:15500|popsicle-6
products|png|1|504:15501|popsicle-7
products|png|1|504:14580|popsicle-bag-mockup
products|png|1|504:16033|sundae-baeleys
products|png|1|504:16371|sundae-cup
products|png|1|504:16774|sundae-photo
products|png|1|504:16904|circle-21-love
products|png|1|504:16919|circle-chocolate
products|png|1|504:16933|circle-butterscotch
products|png|1|504:17390|top-kulfi
products|png|1|504:17416|top-kulfi-2
products|png|1|504:17417|top-kulfi-3
products|png|1|504:17463|kulfi-stick-1
products|png|1|504:17786|kulfi-stick-2
products|png|1|504:18109|kulfi-stick-3
products|png|1|504:18435|kulfi-stick-4
products|png|1|504:18767|kulfi-stick-5
products|png|1|504:14597|product-image-208
products|png|1|504:21056|product-image-439
products|png|1|504:21057|product-image-441
products|png|1|504:21058|product-image-442
products|png|1|504:21068|product-image-445
products|png|1|504:21069|product-image-446
products|png|1|504:21070|product-image-447
products|png|1|504:21071|product-image-448
packaging|png|1|504:19511|lid-40ml
packaging|png|1|504:19889|lid-50ml-vanilla
packaging|png|1|504:19907|lid-50ml-butterscotch
packaging|png|1|504:19925|lid-50ml-strawberry
packaging|png|1|504:19943|lid-50ml-21-love
packaging|png|1|504:19961|lid-50ml-chocolate
packaging|png|1|504:19979|cup-50ml-vanilla
packaging|png|1|504:20068|cup-50ml-chocolate
packaging|png|1|504:20253|cup-50ml-butterscotch
packaging|png|1|504:20388|cup-50ml-strawberry
packaging|png|1|504:20565|cup-50ml-21-love
packaging|png|1|504:12762|box-4ltr
packaging|png|1|504:6081|tub-100ml-1
packaging|png|1|504:6251|tub-100ml-2
packaging|png|1|504:6421|tub-100ml-3
packaging|png|1|504:6639|tub-100ml-4
packaging|png|1|504:6824|tub-100ml-5
packaging|png|1|504:7007|tub-100ml-6
packaging|png|1|504:7224|tub-100ml-7
packaging|png|1|504:7368|tub-100ml-8
packaging|png|1|504:4397|tub-500ml-1
packaging|png|1|504:4586|tub-500ml-2
packaging|png|1|504:4757|tub-500ml-3
packaging|png|1|504:4998|tub-500ml-4
packaging|png|1|504:5210|tub-500ml-5
packaging|png|1|504:5417|tub-500ml-6
packaging|png|1|504:5658|tub-500ml-7
packaging|png|1|504:5824|tub-500ml-8
packaging|png|1|504:7599|tub-1000ml-1
packaging|png|1|504:7777|tub-1000ml-2
packaging|png|1|504:8379|tub-1000ml-3
packaging|png|1|504:8601|tub-1000ml-4
packaging|png|1|504:8807|tub-1000ml-5
packaging|png|1|504:8991|tub-1000ml-6
packaging|png|1|504:9211|tub-1000ml-7
packaging|png|1|504:9356|tub-1000ml-8
characters|svg|1|504:1025|character-sheet
characters|png|1|504:1025|character-sheet
characters|png|1|504:9836|characters
characters|png|1|504:14598|characters-1
characters|png|1|504:2|monsters
characters|png|1|504:9834|monsters-2
EOF
)

# Group by format+scale so each group is one /v1/images request (max 50 ids per request).
echo "$ASSETS" | cut -d'|' -f2,3 | sort -u | while IFS='|' read -r fmt scale; do
  rows=$(echo "$ASSETS" | awk -F'|' -v f="$fmt" -v s="$scale" '$2==f && $3==s')
  echo "$rows" | cut -d'|' -f4 | xargs -n 50 | while read -r chunk; do
    ids=$(echo "$chunk" | tr ' ' ',')
    echo "Rendering $(echo "$chunk" | wc -w) nodes as $fmt @${scale}x..."
    resp=$(curl -sS -H "X-Figma-Token: $FIGMA_TOKEN" \
      "https://api.figma.com/v1/images/$FILE?ids=$ids&format=$fmt&scale=$scale")
    if [ "$(echo "$resp" | jq -r '.err // empty')" != "" ] || [ "$(echo "$resp" | jq -r '.status // 200')" != "200" ]; then
      echo "Figma API error: $resp"; exit 1
    fi
    for id in $chunk; do
      url=$(echo "$resp" | jq -r --arg id "$id" '.images[$id] // empty')
      line=$(echo "$rows" | awk -F'|' -v id="$id" '$4==id')
      dir=$(echo "$line" | cut -d'|' -f1); name=$(echo "$line" | cut -d'|' -f5)
      if [ -z "$url" ]; then echo "  ! no render for $id ($name)"; continue; fi
      mkdir -p "$OUT/$dir"
      curl -sSfL -o "$OUT/$dir/$name.$fmt" "$url" && echo "  $dir/$name.$fmt"
    done
  done
done
