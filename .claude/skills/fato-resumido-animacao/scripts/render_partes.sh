#!/bin/bash
# Renderização em pedaços, retomável (se a sessão reiniciar, roda de novo e ele pula o que já terminou).
# uso: render_partes.sh pagina.html pasta_saida total_quadros [faixas=4] [tam_pedaco=200]
H=$(realpath "$1");O=$(realpath -m "$2");N=$3;L=${4:-4};C=${5:-200};D=$(dirname "$(realpath "$0")");mkdir -p "$O"
P=$(( (N+C-1)/C ))
lane(){ for ((c=$1;c<P;c+=L)); do a=$((c*C)); b=$(( (c+1)*C )); [ $b -gt $N ] && b=$N; f="$O/c$(printf %03d $c).mp4"
 n=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$f" 2>/dev/null); [ "$n" = "$((b-a))" ] && continue
 node "$D/render.js" "$H" "$f.part.mp4" 30 $a $b && mv "$f.part.mp4" "$f" && echo "pedaco $c ok"; done; }
for ((k=0;k<L;k++)); do lane $k & done; wait
ls "$O"/c???.mp4 | sed 's/^/file /' > "$O/lista.txt"; ffmpeg -y -loglevel error -f concat -safe 0 -i "$O/lista.txt" -c copy "$O/mudo.mp4" && echo "PRONTO $O/mudo.mp4"
