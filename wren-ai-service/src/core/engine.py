import logging
import re
from abc import ABCMeta, abstractmethod
from typing import Any, Dict, Optional, Tuple

import aiohttp
import sqlglot
from pydantic import BaseModel

logger = logging.getLogger("wren-ai-service")


class EngineConfig(BaseModel):
    provider: str = "wren_ui"
    config: dict = {}


class Engine(metaclass=ABCMeta):
    @abstractmethod
    async def execute_sql(
        self,
        sql: str,
        session: aiohttp.ClientSession,
        dry_run: bool = True,
        **kwargs,
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        ...


def clean_generation_result(result: str) -> str:
    def _normalize_whitespace(s: str) -> str:
        return re.sub(r"\s+", " ", s).strip()

    def _remove_invalid_json_chars(s: str) -> str:
        pattern = r'(\{\s*"results"\s*:\s*\[\s*\{\s*"sql"\s*:\s*".*?"\s*\}\s*\]\s*\})'
        matches = re.findall(pattern, s, re.DOTALL)
        if matches:
            return matches[0]
        return s

    return (
        _normalize_whitespace(_remove_invalid_json_chars(result))
        .replace("\\n", " ")
        .replace("```sql", "")
        .replace("```json", "")
        .replace('"""', "")
        .replace("'''", "")
        .replace("```", "")
        .replace(";", "")
    )


def remove_limit_statement(sql: str) -> str:
    pattern = r"\s*LIMIT\s+\d+(\s*;?\s*--.*|\s*;?\s*)$"
    modified_sql = re.sub(pattern, "", sql, flags=re.IGNORECASE)

    return modified_sql


def add_quotes(sql: str) -> Tuple[str, bool]:
    try:
        quoted_sql = sqlglot.transpile(sql, read="trino", identify=True)[0]
    except Exception as e:
        logger.exception(f"Error in sqlglot.transpile to {sql}: {e}")

        return "", False

    return quoted_sql, True
