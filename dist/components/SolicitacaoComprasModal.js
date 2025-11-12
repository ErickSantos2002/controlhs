import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png'; // ajuste o caminho se necessário
const SolicitacaoComprasModal = ({ aberto, fechar, produtos, solicitante, }) => {
    const [solicitacao, setSolicitacao] = useState([]);
    const [busca, setBusca] = useState('');
    const atualizarQuantidade = (id, quantidade) => {
        setSolicitacao((prev) => {
            const existe = prev.find((item) => item.id === id);
            if (existe) {
                return prev.map((item) => item.id === id ? Object.assign(Object.assign({}, item), { quantidade }) : item);
            }
            else {
                return [...prev, { id, quantidade }];
            }
        });
    };
    const gerarPDF = () => {
        const doc = new jsPDF();
        // Cabeçalho com logo
        doc.addImage(logo, 'PNG', 150, 10, 40, 20);
        doc.setFontSize(16);
        doc.text('Solicitação de Compras', 14, 20);
        doc.setFontSize(10);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
        // Montar tabela
        const dadosTabela = solicitacao
            .filter((item) => item.quantidade > 0)
            .map((item) => {
            var _a;
            const produto = produtos.find((p) => p.id === item.id);
            return [(produto === null || produto === void 0 ? void 0 : produto.nome) || '', (_a = produto === null || produto === void 0 ? void 0 : produto.saldo) !== null && _a !== void 0 ? _a : 0, item.quantidade];
        });
        autoTable(doc, {
            startY: 40,
            head: [['Produto', 'Saldo Atual', 'Quantidade Solicitada']],
            body: dadosTabela,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                halign: 'center',
            }, // títulos centralizados
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { cellWidth: 90, halign: 'center' }, // Produto centralizado
                1: { halign: 'center' }, // Saldo centralizado
                2: { halign: 'center' }, // Quantidade centralizada
            },
        });
        // Rodapé
        doc.setFontSize(12);
        doc.text(`Solicitante: ${solicitante}`, 14, doc.internal.pageSize.height - 10);
        // Salvar
        doc.save(`solicitacao_compras_${new Date().toISOString().split('T')[0]}.pdf`);
        fechar();
    };
    const produtosFiltrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));
    if (!aberto)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-[#0f172a] rounded-xl shadow-lg w-full max-w-2xl p-6 transition-colors", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4", children: "Selecionar Produtos" }), _jsx("input", { type: "text", placeholder: "Pesquisar produto...", className: "w-full px-3 py-2 border rounded-lg mb-4\r\n                    bg-white dark:bg-[#1e293b] text-gray-800 dark:text-gray-200\r\n                    border-gray-300 dark:border-gray-600\r\n                    placeholder-gray-400 dark:placeholder-gray-500\r\n                    focus:outline-none focus:ring-2 focus:ring-blue-500", value: busca, onChange: (e) => setBusca(e.target.value) }), _jsx("div", { className: "max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700", children: produtosFiltrados.map((produto) => (_jsxs("div", { className: "flex items-center justify-between py-2\r\n                        text-gray-800 dark:text-gray-200", children: [_jsxs("span", { children: [produto.nome, ' ', _jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["(Saldo: ", produto.saldo, ")"] })] }), _jsx("input", { type: "number", min: 0, className: "w-24 px-2 py-1 border rounded-lg\r\n                          bg-white dark:bg-[#1e293b]\r\n                          text-gray-800 dark:text-gray-200\r\n                          border-gray-300 dark:border-gray-600", onChange: (e) => atualizarQuantidade(produto.id, Number(e.target.value)) })] }, produto.id))) }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx("button", { onClick: fechar, className: "px-4 py-2 rounded-lg\r\n                      bg-gray-300 text-gray-800 hover:bg-gray-400\r\n                      dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600\r\n                      transition-colors", children: "Cancelar" }), _jsx("button", { onClick: gerarPDF, className: "px-4 py-2 rounded-lg\r\n                      bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-500\r\n                      transition-colors", children: "Gerar PDF" })] })] }) }));
};
export default SolicitacaoComprasModal;
