'use client';
import React, { useMemo } from 'react';
import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SimulatorData } from '@/types';

function calculateFinancing(simulatorData: SimulatorData) {
    const { preco, entradaPct, parcelas, taxaAnual, amortizacao } = simulatorData;
    
    const valorEntrada = preco * (entradaPct / 100);
    const valorFinanciado = preco - valorEntrada;
    if (valorFinanciado <= 0) return null;

    const taxaMensal = (Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100;
    const parcelaSemJuros = valorFinanciado / parcelas;

    let saldoDevedorAmortizado = valorFinanciado;
    let mesesComAmortizacao = 0;
    let totalPagoComAmortizacao = 0;

    while (saldoDevedorAmortizado > 0.01 && mesesComAmortizacao < parcelas * 2) {
      const juros = saldoDevedorAmortizado * (taxaMensal / 100);
      const prestacao = parcelaSemJuros + juros;
      totalPagoComAmortizacao += prestacao;
      const amortizacaoTotal = parcelaSemJuros + (amortizacao || 0);
      saldoDevedorAmortizado -= amortizacaoTotal;
      mesesComAmortizacao++;
    }

    const tabela = [];
    let saldo = valorFinanciado;
    let primeiraPrestacao = 0;
    let totalPrestacoes = 0;

    for (let i = 1; i <= parcelas; i++) {
      const juros = saldo * (taxaMensal / 100);
      const prestacao = parcelaSemJuros + juros;
      if (i === 1) primeiraPrestacao = prestacao;
      totalPrestacoes += prestacao;

      tabela.push({
        parcela: i,
        saldoDevedor: saldo,
        amortizacao: parcelaSemJuros,
        juros,
        prestacao
      });
      saldo -= parcelaSemJuros;
    }
    
    const economiaTempo = parcelas - mesesComAmortizacao;
    const totalPagoNormal = totalPrestacoes;
    const custoRealNormal = totalPagoNormal - valorFinanciado;
    const custoRealAmortizado = totalPagoComAmortizacao - valorFinanciado;

    return {
      valorEntrada, valorFinanciado, taxaMensal, parcelaSemJuros, primeiraPrestacao,
      tempoNormal: parcelas, tempoComAmort: mesesComAmortizacao, economiaTempo,
      totalPagoNormal, custoRealNormal, totalPagoComAmortizacao, custoRealAmortizado,
      tabela
    };
}


export function FinancingSimulator() {
  const { simulatorData, setSimulatorData } = useFinancialData();
  const { nomeA, nomeB, rendaA, rendaB, gastosA, gastosB, amortizacao, parcelasPagas } = simulatorData;

  const handleInputChange = (field: keyof typeof simulatorData, value: string | number | boolean) => {
    setSimulatorData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (parcela: number, checked: boolean) => {
    setSimulatorData(prev => ({
      ...prev,
      parcelasPagas: {
        ...prev.parcelasPagas,
        [parcela]: checked,
      },
    }));
  };

  const results = useMemo(() => calculateFinancing(simulatorData), [simulatorData]);

  if (!results) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>🏠 Dados do Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><Label htmlFor="preco">Preço do Imóvel (R$)</Label><Input id="preco" type="number" value={simulatorData.preco} onChange={e => handleInputChange('preco', Number(e.target.value))} /></div>
            <div><Label htmlFor="entrada">Entrada (%)</Label><Input id="entrada" type="number" value={simulatorData.entradaPct} onChange={e => handleInputChange('entradaPct', Number(e.target.value))} /></div>
            <div><Label htmlFor="parcelas">Parcelas (meses)</Label><Input id="parcelas" type="number" value={simulatorData.parcelas} onChange={e => handleInputChange('parcelas', Number(e.target.value))} /></div>
            <div><Label htmlFor="taxaAnual">Taxa de Juros (% a.a.)</Label><Input id="taxaAnual" type="number" step="0.1" value={simulatorData.taxaAnual} onChange={e => handleInputChange('taxaAnual', Number(e.target.value))} /></div>
          </div>
          <p className="mt-4 text-center text-muted-foreground">Preencha os dados do imóvel para iniciar a simulação.</p>
        </CardContent>
      </Card>
    )
  }

  const { valorEntrada, valorFinanciado, taxaMensal, primeiraPrestacao, tempoNormal, tempoComAmort, economiaTempo, custoRealNormal, custoRealAmortizado, tabela } = results;

  const rendaTotal = rendaA + rendaB;
  const percentualA = rendaTotal > 0 ? (rendaA / rendaTotal) * 100 : 0;
  const percentualB = rendaTotal > 0 ? (rendaB / rendaTotal) * 100 : 0;

  const prestacaoA = primeiraPrestacao * (percentualA / 100);
  const prestacaoB = primeiraPrestacao * (percentualB / 100);
  const amortizacaoA = (amortizacao || 0) * (percentualA / 100);
  const amortizacaoB = (amortizacao || 0) * (percentualB / 100);
  const totalMensalA = prestacaoA + amortizacaoA;
  const totalMensalB = prestacaoB + amortizacaoB;
  const sobraA = rendaA - gastosA - totalMensalA;
  const sobraB = rendaB - gastosB - totalMensalB;
  
  const visibleRows = tabela.filter(row => row.parcela <= 24 || (row.parcela > tempoComAmort - 3 && row.parcela <= tempoNormal));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>🏠 Dados do Imóvel e Financiamento</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><Label htmlFor="preco">Preço do Imóvel (R$)</Label><Input id="preco" type="number" value={simulatorData.preco} onChange={e => handleInputChange('preco', Number(e.target.value))} /></div>
          <div><Label htmlFor="entrada">Entrada (%)</Label><Input id="entrada" type="number" value={simulatorData.entradaPct} onChange={e => handleInputChange('entradaPct', Number(e.target.value))} /></div>
          <div><Label htmlFor="parcelas">Parcelas (meses)</Label><Input id="parcelas" type="number" value={simulatorData.parcelas} onChange={e => handleInputChange('parcelas', Number(e.target.value))} /></div>
          <div><Label htmlFor="taxaAnual">Taxa de Juros (% a.a.)</Label><Input id="taxaAnual" type="number" step="0.1" value={simulatorData.taxaAnual} onChange={e => handleInputChange('taxaAnual', Number(e.target.value))} /></div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>{nomeA}</CardTitle></CardHeader><CardContent className="space-y-2"><div><Label>Renda Mensal</Label><Input type="number" value={rendaA} onChange={e => handleInputChange('rendaA', Number(e.target.value))} /></div><div><Label>Gastos Mensais</Label><Input type="number" value={gastosA} onChange={e => handleInputChange('gastosA', Number(e.target.value))} /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>{nomeB}</CardTitle></CardHeader><CardContent className="space-y-2"><div><Label>Renda Mensal</Label><Input type="number" value={rendaB} onChange={e => handleInputChange('rendaB', Number(e.target.value))} /></div><div><Label>Gastos Mensais</Label><Input type="number" value={gastosB} onChange={e => handleInputChange('gastosB', Number(e.target.value))} /></div></CardContent></Card>
        <Card className="bg-amber-50 border-amber-200"><CardHeader><CardTitle>Amortização Extra</CardTitle></CardHeader><CardContent><div><Label>Valor Mensal</Label><Input type="number" value={amortizacao} onChange={e => handleInputChange('amortizacao', Number(e.target.value))} /></div><CardDescription className="mt-2">Valor adicional para quitar mais rápido.</CardDescription></CardContent></Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card><CardHeader><CardTitle>Valores Iniciais</CardTitle></CardHeader><CardContent><div className="flex justify-between"><span>Valor da Entrada:</span><span className="font-semibold">{formatCurrency(valorEntrada)}</span></div><div className="flex justify-between"><span>Valor Financiado:</span><span className="font-semibold">{formatCurrency(valorFinanciado)}</span></div><div className="flex justify-between"><span>Primeira Prestação:</span><span className="font-semibold">{formatCurrency(primeiraPrestacao)}</span></div><div className="flex justify-between"><span>Taxa Mensal:</span><span className="font-semibold">{formatPercentage(taxaMensal)}</span></div></CardContent></Card>
          <Card className="bg-amber-50 border-amber-200"><CardHeader><CardTitle>Custos Totais</CardTitle></CardHeader><CardContent><div className="flex justify-between"><span>Custo Normal:</span><span className="font-semibold">{formatCurrency(custoRealNormal)}</span></div><div className="flex justify-between"><span>Custo com Amortização:</span><span className="font-semibold text-green-600">{formatCurrency(custoRealAmortizado)}</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Tempo de Quitação</CardTitle></CardHeader><CardContent><div className="flex justify-between"><span>Normal:</span><span className="font-semibold">{(tempoNormal / 12).toFixed(1)} anos</span></div><div className="flex justify-between"><span>Com Amortização:</span><span className="font-semibold text-green-600">{(tempoComAmort / 12).toFixed(1)} anos</span></div><div className="flex justify-between"><span>Economia:</span><span className="font-semibold text-green-600">{(economiaTempo / 12).toFixed(1)} anos</span></div></CardContent></Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Divisão Proporcional - {nomeA}</CardTitle></CardHeader><CardContent><div className="flex justify-between"><span>Participação na Renda:</span><span className="font-semibold">{formatPercentage(percentualA)}</span></div><div className="flex justify-between"><span>Parte da Prestação:</span><span className="font-semibold">{formatCurrency(prestacaoA)}</span></div><div className="flex justify-between"><span>Parte da Amortização:</span><span className="font-semibold">{formatCurrency(amortizacaoA)}</span></div><div className="flex justify-between mt-2 pt-2 border-t"><span>Sobra do Salário:</span><span className={`font-bold ${sobraA < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(sobraA)}</span></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Divisão Proporcional - {nomeB}</CardTitle></CardHeader><CardContent><div className="flex justify-between"><span>Participação na Renda:</span><span className="font-semibold">{formatPercentage(percentualB)}</span></div><div className="flex justify-between"><span>Parte da Prestação:</span><span className="font-semibold">{formatCurrency(prestacaoB)}</span></div><div className="flex justify-between"><span>Parte da Amortização:</span><span className="font-semibold">{formatCurrency(amortizacaoB)}</span></div><div className="flex justify-between mt-2 pt-2 border-t"><span>Sobra do Salário:</span><span className={`font-bold ${sobraB < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(sobraB)}</span></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tabela de Amortização</CardTitle><CardDescription>Mostrando as primeiras 24 e as últimas 3 parcelas a serem pagas.</CardDescription></CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pago</TableHead><TableHead>Parcela</TableHead><TableHead>Saldo Devedor</TableHead><TableHead>Amortização</TableHead><TableHead>Juros</TableHead><TableHead>Prestação</TableHead><TableHead>{nomeA}</TableHead><TableHead>{nomeB}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row, index) => {
                  const parteA = row.prestacao * (percentualA / 100);
                  const parteB = row.prestacao * (percentualB / 100);
                  return (
                    <React.Fragment key={row.parcela}>
                     {index === 24 && tempoComAmort > 27 && (
                       <TableRow><TableCell colSpan={8} className="text-center">...</TableCell></TableRow>
                     )}
                    <TableRow className={row.parcela <= tempoComAmort && (amortizacao || 0) > 0 ? "bg-amber-50" : ""}>
                      <TableCell><Checkbox checked={parcelasPagas[row.parcela] || false} onCheckedChange={(checked) => handleCheckboxChange(row.parcela, !!checked)} /></TableCell>
                      <TableCell>{row.parcela}</TableCell><TableCell>{formatCurrency(row.saldoDevedor)}</TableCell><TableCell>{formatCurrency(row.amortizacao)}</TableCell><TableCell>{formatCurrency(row.juros)}</TableCell><TableCell>{formatCurrency(row.prestacao)}</TableCell><TableCell>{formatCurrency(parteA)}</TableCell><TableCell>{formatCurrency(parteB)}</TableCell>
                    </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
