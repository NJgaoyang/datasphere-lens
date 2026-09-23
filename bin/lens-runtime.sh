#!/bin/bash
set -euo pipefail

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd -P)
ENV_FILE="${PROJECT_ROOT}/.env"
if [ -f "${ENV_FILE}" ]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi
RUNTIME_DIR="${LENS_RUNTIME_DIR:-${PROJECT_ROOT}/runtime}"
PORT="${LENS_PORT:-8091}"
PROFILE="${LENS_PROFILE:-config}"
PID_FILE="${RUNTIME_DIR}/logs/datasphere-lens.pid"
LOG_FILE="${RUNTIME_DIR}/logs/datasphere-lens.log"
START_CLASS="datart.DatartServerApplication"

render_config() {
  [ "${PROFILE}" = "config" ] || return 0
  : "${LENS_DB_HOST:?LENS_DB_HOST is required}"
  : "${LENS_DB_PORT:?LENS_DB_PORT is required}"
  : "${LENS_DB_NAME:?LENS_DB_NAME is required}"
  : "${LENS_DB_USER:?LENS_DB_USER is required}"
  : "${LENS_DB_PASSWORD:?LENS_DB_PASSWORD is required}"
  : "${LENS_TOKEN_SECRET:?LENS_TOKEN_SECRET is required}"
  mkdir -p "${RUNTIME_DIR}/config/profiles"
  cat > "${RUNTIME_DIR}/config/datart.conf" <<EOF
# Generated locally by DataSphere Lens. Do not commit.
datasource.ip=${LENS_DB_HOST}
datasource.port=${LENS_DB_PORT}
datasource.database=${LENS_DB_NAME}
datasource.username=${LENS_DB_USER}
datasource.password=${LENS_DB_PASSWORD}
server.port=${PORT}
server.address=0.0.0.0
datart.address=http://127.0.0.1:${PORT}
datart.send-mail=false
datart.webdriver-path=
datart.user.register=false
datart.tenant-management-mode=platform
EOF
  chmod 600 "${RUNTIME_DIR}/config/datart.conf"
}

find_package() {
  find "${PROJECT_ROOT}" -maxdepth 1 -type f \
    -name 'datart-server-*-install.zip' -print | sort | tail -1
}

deploy() {
  local package temp
  package=$(find_package)
  [ -n "${package}" ] || { echo "未找到安装包，请先构建项目"; exit 1; }
  temp=$(mktemp -d)
  unzip -q "${package}" -d "${temp}"
  mkdir -p "${RUNTIME_DIR}"
  find "${RUNTIME_DIR}" -mindepth 1 -maxdepth 1 \
    ! -name logs -exec rm -rf {} +
  cp -a "${temp}/." "${RUNTIME_DIR}/"
  mkdir -p "${RUNTIME_DIR}/logs"
  rm -rf "${temp}"
  render_config
  echo "DataSphere Lens 已部署到 ${RUNTIME_DIR}"
}

is_running() {
  [ -f "${PID_FILE}" ] || return 1
  local pid
  pid=$(cat "${PID_FILE}")
  kill -0 "${pid}" 2>/dev/null
}

start() {
  if is_running; then
    echo "DataSphere Lens 已运行，PID $(cat "${PID_FILE}")"
    return
  fi
  [ -d "${RUNTIME_DIR}/lib" ] || deploy
  render_config
  mkdir -p "${RUNTIME_DIR}/logs"
  export DATART_TOKEN_SECRET="${LENS_TOKEN_SECRET:-}"
  local java_cmd="${JAVA_HOME:+${JAVA_HOME}/bin/}java"
  command -v "${java_cmd}" >/dev/null 2>&1 || java_cmd=java
  [ -x "${java_cmd}" ] || java_cmd=java
  echo "启动 DataSphere Lens: profile=${PROFILE}, port=${PORT}"
  (
    cd "${RUNTIME_DIR}"
    nohup "${java_cmd}" -server -Xms512m -Xmx2g \
      --add-opens java.base/java.lang=ALL-UNNAMED \
      --add-opens java.base/java.lang.reflect=ALL-UNNAMED \
      --add-opens java.base/java.util=ALL-UNNAMED \
      --add-opens java.base/java.io=ALL-UNNAMED \
      --add-opens java.base/java.nio=ALL-UNNAMED \
      --add-opens java.base/java.math=ALL-UNNAMED \
      --add-opens java.base/sun.nio.ch=ALL-UNNAMED \
      --add-opens java.base/sun.security.util=ALL-UNNAMED \
      -Dfastjson2.parser.safeMode=true \
      -Dfile.encoding=UTF-8 \
      -Dspring.config.additional-location=file:./config/profiles/ \
      -cp 'lib/*' "${START_CLASS}" \
      --spring.profiles.active="${PROFILE}" \
      --spring.main.allow-circular-references=true \
      --server.port="${PORT}" \
      --datart.server.address="http://127.0.0.1:${PORT}" \
      >"${LOG_FILE}" 2>&1 &
    echo $! > "${PID_FILE}"
  )
  for _ in $(seq 1 60); do
    if ! is_running; then
      break
    fi
    if grep -Eq 'Started DatartServerApplication|The application is running in .* tenant-management-mode' "${LOG_FILE}" 2>/dev/null; then
      echo "DataSphere Lens 已启动，PID $(cat "${PID_FILE}"), port=${PORT}"
      return
    fi
    sleep 1
  done
  echo "DataSphere Lens 启动失败，最近日志："
  tail -100 "${LOG_FILE}" || true
  rm -f "${PID_FILE}"
  exit 1
}

stop() {
  if ! is_running; then
    rm -f "${PID_FILE}"
    echo "DataSphere Lens 未运行"
    return
  fi
  local pid
  pid=$(cat "${PID_FILE}")
  kill "${pid}"
  for _ in $(seq 1 20); do
    kill -0 "${pid}" 2>/dev/null || break
    sleep 1
  done
  kill -0 "${pid}" 2>/dev/null && kill -9 "${pid}" || true
  rm -f "${PID_FILE}"
  echo "DataSphere Lens 已停止"
}
status() {
  if is_running; then
    echo "DataSphere Lens 运行中: PID $(cat "${PID_FILE}"), port=${PORT}"
  else
    echo "DataSphere Lens 未运行"
    return 1
  fi
}

case "${1:-status}" in
  deploy) deploy ;;
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) status ;;
  logs) tail -f "${LOG_FILE}" ;;
  *)
    echo "Usage: $0 {deploy|start|stop|restart|status|logs}"
    exit 1
    ;;
esac
