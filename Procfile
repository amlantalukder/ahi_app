web: pkill -f ahi_app/.venv/bin/gunicorn
    ps aux | grep ahi_app/.venv/bin/gunicorn
    cd web_app
    npm run build
    ./.venv/bin/gunicorn -w 1 -b edelgene:5003 server:app --timeout 0 --daemon