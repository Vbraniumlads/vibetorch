import { useState } from "react";
import { CalendarDays, Download, Filter, DollarSign, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const usageData = [
  {
    buyerId: "buyer_7k9m2n",
    model: "GPT-4 Turbo",
    timeUsed: "2h 34m",
    tokensConsumed: "45,231",
    feeEarned: "$12.45"
  },
  {
    buyerId: "buyer_3x8p1q",
    model: "Claude 3 Opus",
    timeUsed: "1h 12m",
    tokensConsumed: "28,142",
    feeEarned: "$8.67"
  },
  {
    buyerId: "buyer_9z2v4t",
    model: "GPT-4",
    timeUsed: "45m",
    tokensConsumed: "19,873",
    feeEarned: "$5.23"
  },
  {
    buyerId: "buyer_1m5n8r",
    model: "Gemini Pro",
    timeUsed: "3h 21m",
    tokensConsumed: "67,429",
    feeEarned: "$15.82"
  },
  {
    buyerId: "buyer_4j7k9l",
    model: "Claude 3 Haiku",
    timeUsed: "28m",
    tokensConsumed: "12,546",
    feeEarned: "$2.91"
  }
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("7d");

  const totalEarnings = usageData.reduce((sum, item) => 
    sum + parseFloat(item.feeEarned.replace('$', '')), 0
  );

  const totalTokens = usageData.reduce((sum, item) => 
    sum + parseInt(item.tokensConsumed.replace(',', '')), 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">LLM Credit Sales Summary</h1>
          <p className="text-muted-foreground mt-1 flex items-center">
            <CalendarDays className="w-4 h-4 mr-2" />
            Billing period: Jan 1 - Jan 31, 2024
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 day</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="border-neon text-primary hover:bg-primary/10">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elevated bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-primary" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neon">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% from last period</p>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Zap className="w-4 h-4 mr-2 text-neon-cyan" />
              Tokens Consumed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all models</p>
          </CardContent>
        </Card>

        <Card className="card-elevated bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-2 text-neon-purple" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{usageData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Current billing period</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Table */}
      <Card className="card-elevated bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Usage Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground font-medium">Buyer ID</TableHead>
                <TableHead className="text-muted-foreground font-medium">Model Used</TableHead>
                <TableHead className="text-muted-foreground font-medium">Time Used</TableHead>
                <TableHead className="text-muted-foreground font-medium">Tokens Consumed</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Fee Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.map((row, index) => (
                <TableRow key={index} className="border-border/30 hover:bg-secondary/30 transition-colors">
                  <TableCell className="font-mono text-sm text-foreground">{row.buyerId}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {row.model}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">{row.timeUsed}</TableCell>
                  <TableCell className="font-mono text-foreground">{row.tokensConsumed}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{row.feeEarned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}