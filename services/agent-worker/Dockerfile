FROM python:3.11-slim

WORKDIR /app

COPY services/agent-worker/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/agent-worker ./

EXPOSE 5001

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
