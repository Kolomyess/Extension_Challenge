import re
from typing import Any


IRRELEVANT_PHRASES = [
    "sim",
    "não",
    "nao",
    "ok",
    "okay",
    "tá",
    "ta",
    "beleza",
    "certo",
    "entendi",
    "obrigado",
    "obrigada",
    "valeu",
    "bom dia",
    "boa tarde",
    "boa noite",
    "alô",
    "alo",
    "teste",
    "consegue me ouvir",
    "estão me ouvindo",
    "estao me ouvindo",
    "vou conectar",
    "ele vai conectar",
    "só um minuto",
    "so um minuto",
    "peraí",
    "perai",
]


IMPORTANT_KEYWORDS = [
    # dor / problema
    "problema",
    "problemas",
    "dificuldade",
    "dificuldades",
    "dor",
    "travado",
    "retrabalho",
    "manual",
    "manualmente",
    "demora",
    "demorado",
    "lento",
    "atraso",
    "atrasando",
    "perde tempo",
    "perdendo tempo",
    "não conseguimos",
    "nao conseguimos",
    "não funciona",
    "nao funciona",

    # preço / orçamento
    "caro",
    "preço",
    "preco",
    "custo",
    "custoso",
    "orçamento",
    "orcamento",
    "investimento",
    "valor",
    "barato",
    "desconto",
    "pagar",

    # oportunidade / compra
    "comprar",
    "contratar",
    "contratação",
    "contratacao",
    "proposta",
    "demonstração",
    "demonstracao",
    "orçar",
    "orcar",
    "cotação",
    "cotacao",
    "implementar",
    "implantação",
    "implantacao",

    # decisão / prazo
    "decisão",
    "decisao",
    "aprovação",
    "aprovacao",
    "diretoria",
    "gestor",
    "gerente",
    "prazo",
    "urgente",
    "este mês",
    "esse mês",
    "este mes",
    "esse mes",
    "semana que vem",

    # concorrência / risco
    "concorrente",
    "concorrência",
    "concorrencia",
    "outro fornecedor",
    "outra ferramenta",
    "cancelar",
    "trocar",
    "migrar",

    # necessidades técnicas
    "integração",
    "integracao",
    "api",
    "relatório",
    "relatorio",
    "dashboard",
    "planilha",
    "planilhas",
    "automação",
    "automacao",
    "segurança",
    "seguranca",
    "lgpd",
    "compliance",

    # áreas comuns de venda B2B
    "rh",
    "financeiro",
    "vendas",
    "comercial",
    "estoque",
    "logística",
    "logistica",
    "atendimento",
]


QUESTION_KEYWORDS = [
    "como funciona",
    "quanto custa",
    "qual o preço",
    "qual o preco",
    "tem integração",
    "tem integracao",
    "vocês fazem",
    "voces fazem",
    "é possível",
    "e possivel",
    "consegue",
    "dá para",
    "da para",
    "prazo",
]


def normalize_text(value: str):
    return re.sub(r"\s+", " ", value.lower()).strip()


def get_caption_text(caption: dict[str, Any]):
    return normalize_text(caption.get("text", ""))


def is_irrelevant_short_phrase(text: str):
    if len(text.split()) > 4:
        return False

    return text in IRRELEVANT_PHRASES


def has_important_keyword(text: str):
    return any(keyword in text for keyword in IMPORTANT_KEYWORDS)


def has_important_question(text: str):
    if "?" in text:
        return True

    return any(keyword in text for keyword in QUESTION_KEYWORDS)


def has_enough_content(text: str):
    words = text.split()

    if len(words) >= 7:
        return True

    if len(text) >= 45:
        return True

    return False


def should_analyze_caption(
    caption: dict[str, Any],
    recent_captions: list[dict[str, Any]] | None = None,
):
    text = get_caption_text(caption)

    if not text:
        return False, "texto vazio"

    if is_irrelevant_short_phrase(text):
        return False, "frase curta irrelevante"

    if has_important_keyword(text):
        return True, "palavra-chave importante"

    if has_important_question(text):
        return True, "pergunta importante"

    if not has_enough_content(text):
        return False, "conteúdo curto sem sinal comercial"

    recent_captions = recent_captions or []

    context_lines = [
        normalize_text(item.get("text", ""))
        for item in recent_captions[-4:]
        if item.get("text")
    ]

    context = " ".join(context_lines + [text])

    if has_important_keyword(context):
        return True, "contexto recente importante"

    return False, "sem sinal comercial relevante"