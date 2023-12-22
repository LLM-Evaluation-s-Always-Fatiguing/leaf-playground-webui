import styled from '@emotion/styled';

const MarkdownStylesProvider = styled.div`
    --font-family-monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New,
    monospace;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin-top: calc(1.55 * 2rem);
        margin-bottom: 0.625rem;
    }

    h1 {
        font-size: 2.125rem;
        line-height: 1.3;
        font-weight: 700;
    }

    h2 {
        font-size: 1.625rem;
        line-height: 1.35;
        font-weight: 700;
    }

    h3 {
        font-size: 1.375rem;
        line-height: 1.4;
        font-weight: 700;
    }

    h4 {
        font-size: 1.125rem;
        line-height: 1.45;
        font-weight: 700;
    }

    h5 {
        font-size: 1rem;
        line-height: 1.5;
        font-weight: 700;
    }

    h6 {
        font-size: 0.875rem;
        line-height: 1.5;
        font-weight: 700;
    }

    img {
        max-width: 100%;
        margin-bottom: 0.625rem;
    }

    p {
        margin-top: 0;
        margin-bottom: 1.25rem;
    }

    mark {
        background-color: #ffec99;
        color: inherit;
    }

    a {
        color: #4dabf7;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
        border: 0;
        border-top: 1px solid;
        border-color: #dee2e6;
    }

    pre {
        padding: 0.625rem;
        line-height: 1.55;
        margin: 1rem 0;
        overflow-x: auto;
        font-family: var(--font-family-monospace);
        font-size: 0.75rem;
        border-radius: 0.25rem;
        background-color: #f8f9fa;

        code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            color: inherit;
            border: 0;
        }
    }

    kbd {
        --kbd-fz: 12px;
        --kbd-padding: 3px 5px;
        --kbd-border-color: #dee2e6;
        --kbd-color: #495057;
        --kbd-bg: #f8f9fa;

        font-family: var(--font-family-monospace);
        line-height: 1.55;
        font-weight: 700;
        padding: var(--kbd-padding);
        font-size: var(--kbd-fz);
        border-radius: 0.25rem;
        border: 1px solid var(--kbd-border-color);
        border-bottom-width: 3px;
        background-color: var(--kbd-bg);
        color: var(--kbd-color);
    }

    code {
        line-height: 1.55;
        padding: 1px 5px;
        border-radius: 0.25rem;
        font-family: var(--font-family-monospace);
        font-size: 0.75rem;
        background-color: #f8f9fa;
        color: #000;
    }

    ul,
    ol {
        margin-bottom: 1rem;
        padding-left: 38px;

        li {
            margin-bottom: 0.625rem;
        }
    }

    table {
        width: 100%;
        border-collapse: collapse;
        caption-side: bottom;
        margin-bottom: 1rem;

        caption {
            margin-top: 0.625rem;
            font-size: 0.875rem;
            color: #868e96;
        }

        th {
            text-align: left;
            font-weight: bold;
            color: #495057;
            font-size: 0.875rem;
            padding: 0.625rem 0.75rem;
        }

        thead th {
            border-bottom: 1px solid;
            border-color: #dee2e6;
        }

        tfoot th {
            border-top: 1px solid;
            border-color: #dee2e6;
        }

        td {
            padding: 0.625rem 0.75rem;
            border-bottom: 1px solid;
            border-color: #dee2e6;
            font-size: 0.875rem;
        }

        tr:last-of-type td {
            border-bottom: 0;
        }
    }

    blockquote {
        font-size: 1.125rem;
        line-height: 1.55;
        margin: 1rem 0;
        border-radius: 0.25rem;
        padding: 1rem 1.25rem;
        background-color: #f8f9fa;
    }
`;

export default MarkdownStylesProvider;
