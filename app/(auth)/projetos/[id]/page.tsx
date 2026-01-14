"use client";

import { IconKey, IconReload } from "@tabler/icons-react";
import { CopyIcon, Loader2 } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getApiDetails } from "@/actions/get-api-details";
import { refreshApiTabs } from "@/actions/refresh-api-tabs";
import { updateApiStatus } from "@/actions/update-api-status";
import { updateTabConfig } from "@/actions/update-tab-config";
import { buildEndpoint } from "@/lib/build-endpoint";
import { CodeExample, type CodeSnippet } from "./_components/code-block";

type ProjectIdPageProps = { params: Promise<{ id: string }> };

export interface APITab {
  id: string;
  tabName: string;
  tabIndex: number;
  allowGet: boolean;
  allowPost: boolean;
  allowPatch: boolean;
  allowDelete: boolean;
  authType: string;
  bearerToken: string | null;
}

export interface API {
  id: string;
  name: string;
  apiKey: string;
  spreadsheetId: string;
  spreadsheetUrl: string | null;
  isActive?: boolean;
  tabs: APITab[];
}

export type ConfigState = {
  allowGet: boolean;
  allowPost: boolean;
  allowPatch: boolean;
  allowDelete: boolean;
  authType: "none" | "bearer";
  bearerToken: string;
};

export default function Page({ params }: ProjectIdPageProps) {
  const resolvedParams = use(params);

  const [api, setApi] = useState<API | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloadingTabs, setReloadingTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isActiveApi, setIsActiveApi] = useState<boolean>(true);

  const [config, setConfig] = useState<ConfigState>({
    allowGet: true,
    allowPost: false,
    allowPatch: false,
    allowDelete: false,
    authType: "none",
    bearerToken: "",
  });

  const fetchAPIData = async () => {
    setLoading(true);
    try {
      const data = await getApiDetails(resolvedParams.id);
      setApi(data);

      if (data.tabs && data.tabs.length > 0) {
        setActiveTab(data.tabs[0].id);
      }

      if (typeof data.isActive === "boolean") {
        setIsActiveApi(data.isActive);
      } else {
        setIsActiveApi(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      toast.error(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleReloadTabs = async () => {
    if (!api) {
      await fetchAPIData();
      return;
    }

    setReloadingTabs(true);
    try {
      await refreshApiTabs(api.id);

      await fetchAPIData();
      toast.success("Tabelas/abas sincronizadas com o Google Sheets!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao recarregar/sincronizar abas:", err);
      toast.error(err.message || "Erro ao recarregar as tabelas/abas");
    } finally {
      setReloadingTabs(false);
    }
  };

  useEffect(() => {
    fetchAPIData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  useEffect(() => {
    if (activeTab && api?.tabs) {
      const current = api.tabs.find((t) => t.id === activeTab);
      if (current) {
        setConfig({
          allowGet: current.allowGet,
          allowPost: current.allowPost,
          allowPatch: current.allowPatch,
          allowDelete: current.allowDelete,
          authType: (current.authType as "none" | "bearer") || "none",
          bearerToken: current.bearerToken || "",
        });
      }
    }
  }, [activeTab, api]);

  const endpoint = useMemo(() => {
    if (!api || !activeTab) return "";
    const t = api.tabs.find((tb) => tb.id === activeTab);
    if (!t) return "";
    return buildEndpoint(window.location.origin, api.apiKey, t.tabName);
  }, [api, activeTab]);

  const handleSave = async () => {
    if (!activeTab || !api) return;

    const previousIsActive = isActiveApi;
    setSaving(true);

    try {
      const [, statusResult] = await Promise.all([
        updateTabConfig(activeTab, config),
        updateApiStatus(api.id, isActiveApi),
      ]);

      if (statusResult && !statusResult.success) {
        const errorMessage =
          "error" in statusResult &&
          typeof statusResult.error === "string" &&
          statusResult.error.trim()
            ? statusResult.error
            : "Não foi possível atualizar o status da API. Tente novamente.";

        setIsActiveApi(previousIsActive);
        toast.error(errorMessage);
        return;
      }

      toast.success("Configurações salvas!");
      await fetchAPIData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setIsActiveApi(previousIsActive);
      toast.error(err.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const generateBearerToken = () => {
    const token =
      "bearer_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setConfig((c) => ({ ...c, bearerToken: token }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const getSnippetsForMethod = (method: "GET" | "POST" | "PATCH" | "DELETE"): CodeSnippet[] => {
    if (!endpoint) return [];

    const hasAuth = config.authType === "bearer" && !!config.bearerToken;
    const authHeaderJs = hasAuth ? `,\n    "Authorization": "Bearer ${config.bearerToken}"` : "";
    const authHeaderCurl = hasAuth ? ` \\\n  -H "Authorization: Bearer ${config.bearerToken}"` : "";
    const authHeaderPy = hasAuth ? `\n    "Authorization": "Bearer ${config.bearerToken}",` : "";
    const authHeaderPhp = hasAuth ? `,\n    "Authorization: Bearer ${config.bearerToken}"` : "";
    const authHeaderRb = hasAuth
      ? `\nrequest["Authorization"] = "Bearer ${config.bearerToken}"`
      : "";

    let jsFetch = "";
    let curl = "";
    let python = "";
    let phpCurl = "";
    let ruby = "";

    if (method === "GET") {
      jsFetch = `fetch("${endpoint}", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"${authHeaderJs}
  }
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    // Exemplo de item:
    // {
    //   "_rowIndex": 5,
    //   "Nome": "João Silva",
    //   "Email": "joao@example.com",
    //   "Status": "Ativo"
    // }
  })
  .catch((err) => {
    console.error(err);
  });`;

      curl = `curl -X GET "${endpoint}" \\
  -H "Content-Type: application/json"${authHeaderCurl}`;

      python = `import requests

url = "${endpoint}"

headers = {
    "Content-Type": "application/json",${authHeaderPy}
}

response = requests.get(url, headers=headers)

print(response.status_code)
print(response.json())  # Lista de registros com _rowIndex`;

      phpCurl = `<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "${endpoint}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"${authHeaderPhp}
]);

$response = curl_exec($ch);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    echo "Erro: $error";
} else {
    echo $response; // Lista de registros com _rowIndex
}`;

      ruby = `require "net/http"
require "uri"
require "json"

uri = URI("${endpoint}")

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = uri.scheme == "https"

request = Net::HTTP::Get.new(uri)
request["Content-Type"] = "application/json"${authHeaderRb}

response = http.request(request)

puts response.code
puts response.body # Lista de registros com _rowIndex`;
    }

    if (method === "POST") {
      jsFetch = `const payload = {
  // Cada chave precisa ser igual ao cabeçalho da planilha
  "Nome": "João Silva",
  "Email": "joao@example.com",
  "Status": "Ativo"
};

fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"${authHeaderJs}
  },
  body: JSON.stringify(payload)
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Criado com sucesso:", data);
  })
  .catch((err) => {
    console.error(err);
  });`;

      curl = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json"${authHeaderCurl} \\
  -d '{
    "Nome": "João Silva",
    "Email": "joao@example.com",
    "Status": "Ativo"
  }'`;

      python = `import requests

url = "${endpoint}"

payload = {
    "Nome": "João Silva",
    "Email": "joao@example.com",
    "Status": "Ativo",
}

headers = {
    "Content-Type": "application/json",${authHeaderPy}
}

response = requests.post(url, json=payload, headers=headers)

print(response.status_code)
print(response.json())`;

      phpCurl = `<?php

$url = "${endpoint}";

$payload = [
    "Nome"   => "João Silva",
    "Email"  => "joao@example.com",
    "Status" => "Ativo",
];

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"${authHeaderPhp}
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    echo "Erro: $error";
} else {
    echo $response;
}`;

      ruby = `require "net/http"
require "uri"
require "json"

uri = URI("${endpoint}")

payload = {
  "Nome" => "João Silva",
  "Email" => "joao@example.com",
  "Status" => "Ativo"
}

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = uri.scheme == "https"

request = Net::HTTP::Post.new(uri)
request["Content-Type"] = "application/json"${authHeaderRb}
request.body = payload.to_json

response = http.request(request)

puts response.code
puts response.body`;
    }

    if (method === "PATCH") {
      jsFetch = `const payload = {
  // _rowIndex vem do GET (linha da planilha que você quer alterar)
  "_rowIndex": 5,
  // Campos que você quer atualizar
  "Status": "Inativo"
};

fetch("${endpoint}", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json"${authHeaderJs}
  },
  body: JSON.stringify(payload)
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Atualizado com sucesso:", data);
  })
  .catch((err) => {
    console.error(err);
  });`;

      curl = `curl -X PATCH "${endpoint}" \\
  -H "Content-Type: application/json"${authHeaderCurl} \\
  -d '{
    "_rowIndex": 5,
    "Status": "Inativo"
  }'`;

      python = `import requests

url = "${endpoint}"

payload = {
    "_rowIndex": 5,  # valor retornado no GET
    "Status": "Inativo",
}

headers = {
    "Content-Type": "application/json",${authHeaderPy}
}

response = requests.patch(url, json=payload, headers=headers)

print(response.status_code)
print(response.json())`;

      phpCurl = `<?php

$url = "${endpoint}";

$payload = [
    "_rowIndex" => 5, // valor retornado no GET
    "Status"    => "Inativo",
];

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"${authHeaderPhp}
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    echo "Erro: $error";
} else {
    echo $response;
}`;

      ruby = `require "net/http"
require "uri"
require "json"

uri = URI("${endpoint}")

payload = {
  "_rowIndex" => 5, # valor retornado no GET
  "Status" => "Inativo"
}

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = uri.scheme == "https"

request = Net::HTTP::Patch.new(uri)
request["Content-Type"] = "application/json"${authHeaderRb}
request.body = payload.to_json

response = http.request(request)

puts response.code
puts response.body`;
    }

    if (method === "DELETE") {
      jsFetch = `const payload = {
  // _rowIndex vem do GET (linha da planilha que você quer deletar)
  "_rowIndex": 5
};

fetch("${endpoint}", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json"${authHeaderJs}
  },
  body: JSON.stringify(payload)
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Deletado com sucesso:", data);
  })
  .catch((err) => {
    console.error(err);
  });`;

      curl = `curl -X DELETE "${endpoint}" \\
  -H "Content-Type: application/json"${authHeaderCurl} \\
  -d '{
    "_rowIndex": 5
  }'`;

      python = `import requests

url = "${endpoint}"

payload = {
    "_rowIndex": 5,  # valor retornado no GET
}

headers = {
    "Content-Type": "application/json",${authHeaderPy}
}

response = requests.delete(url, json=payload, headers=headers)

print(response.status_code)
print(response.json())`;

      phpCurl = `<?php

$url = "${endpoint}";

$payload = [
    "_rowIndex" => 5, // valor retornado no GET
];

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"${authHeaderPhp}
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    echo "Erro: $error";
} else {
    echo $response;
}`;

      ruby = `require "net/http"
require "uri"
require "json"

uri = URI("${endpoint}")

payload = {
  "_rowIndex" => 5 # valor retornado no GET
}

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = uri.scheme == "https"

request = Net::HTTP::Delete.new(uri)
request["Content-Type"] = "application/json"${authHeaderRb}
request.body = payload.to_json

response = http.request(request)

puts response.code
puts response.body`;
    }

    return [
      {
        language: "ts",
        filename: "fetch-example.ts",
        code: jsFetch,
      },
      {
        language: "bash",
        filename: "curl.sh",
        code: curl,
      },
      {
        language: "php",
        filename: "example.php",
        code: phpCurl,
      },
      {
        language: "python",
        filename: "example.py",
        code: python,
      },
      {
        language: "ruby",
        filename: "example.rb",
        code: ruby,
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-zinc-600">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando...
      </div>
    );
  }

  if (!api || !api.tabs || api.tabs.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-700">
        <p>API não encontrada ou sem abas configuradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header superior */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center lg:gap-20">
        <h1 className="text-2xl font-bold text-zinc-900 lg:max-w-150">{api.name}</h1>

        <div className="flex items-center gap-4">
          <div className="flex h-8 items-center space-x-2 border-r border-l-gray-700 pr-4">
            <Switch
              id="api-active"
              checked={isActiveApi}
              onCheckedChange={(checked) => {
                setIsActiveApi(Boolean(checked));
              }}
            />
            <Label htmlFor="api-active">API ativa</Label>
          </div>
          <Button
            type="button"
            onClick={handleReloadTabs}
            className="cursor-pointer"
            variant="outline"
            disabled={reloadingTabs}
          >
            {reloadingTabs ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sincronizando...
              </>
            ) : (
              <>
                <IconReload className="mr-1 h-4 w-4" /> Recarregar tabelas
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs: abas da planilha */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex w-full flex-col gap-8 lg:flex-row"
      >
        <TabsList className="flex h-fit w-full flex-1 flex-col gap-2 p-2 lg:max-w-80">
          {api.tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="w-full cursor-pointer text-sm">
              {tab.tabName}
            </TabsTrigger>
          ))}
        </TabsList>

        {api.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="flex-1 space-y-7">
            {/* Endpoint + copiar */}
            <div className="flex gap-4">
              <Input
                placeholder="Endpoint"
                value={buildEndpoint(window.location.origin, api.apiKey, tab.tabName)}
                disabled
              />
              <Button
                size="icon"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  copyToClipboard(buildEndpoint(window.location.origin, api.apiKey, tab.tabName))
                }
              >
                <CopyIcon />
              </Button>
            </div>

            {/* Autenticação */}
            <div>
              <Label>Autenticação</Label>
              <RadioGroup
                value={config.authType}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    authType: value as ConfigState["authType"],
                    ...(value === "none" ? { bearerToken: "" } : {}),
                  }))
                }
                className="[&_svg]:fill-primary mt-3 flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">Nenhum (Público)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bearer" id="bearer" />
                  <Label htmlFor="bearer">Bearer Token</Label>
                </div>
              </RadioGroup>

              {config.authType === "bearer" && (
                <div className="mt-4 flex gap-4">
                  <Input
                    placeholder="Token"
                    value={config.bearerToken}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, bearerToken: e.target.value }))
                    }
                  />
                  <Button type="button" onClick={generateBearerToken} className="cursor-pointer">
                    <IconKey className="mr-1 h-4 w-4" /> Gerar Token
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => config.bearerToken && copyToClipboard(config.bearerToken)}
                    disabled={!config.bearerToken}
                  >
                    <CopyIcon />
                  </Button>
                </div>
              )}
            </div>

            {/* Métodos HTTP */}
            <div>
              <Label>Métodos HTTP permitidos</Label>
              <div className="mt-3 flex flex-wrap gap-6">
                {[
                  ["get", "GET", "allowGet"] as const,
                  ["post", "POST", "allowPost"] as const,
                  ["patch", "PATCH", "allowPatch"] as const,
                  ["delete", "DELETE", "allowDelete"] as const,
                ].map(([id, label, key]) => (
                  <div key={id} className="flex items-center gap-3">
                    <Checkbox
                      id={id}
                      checked={config[key]}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          [key]: Boolean(checked),
                        }))
                      }
                      className="data-[state=checked]:bg-primary border border-zinc-900"
                    />
                    <Label htmlFor={id} className="mt-1">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Exemplos de uso */}
            <div>
              <Label>Como usar?</Label>
              <Accordion type="single" collapsible className="mt-3 space-y-5">
                {config.allowPost && (
                  <AccordionItem
                    value="post"
                    className="w-full max-w-full overflow-auto border! px-4"
                  >
                    <AccordionTrigger className="cursor-pointer">
                      POST - Criar registro
                    </AccordionTrigger>
                    <AccordionContent className="overflow-x-hidden!">
                      <CodeExample snippets={getSnippetsForMethod("POST")} />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {config.allowGet && (
                  <AccordionItem
                    value="get"
                    className="w-full max-w-full overflow-auto border! px-4"
                  >
                    <AccordionTrigger className="cursor-pointer">
                      GET - Buscar dados
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeExample snippets={getSnippetsForMethod("GET")} />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {config.allowPatch && (
                  <AccordionItem
                    value="patch"
                    className="w-full max-w-full overflow-auto border! px-4"
                  >
                    <AccordionTrigger className="cursor-pointer">
                      PATCH - Atualizar registro
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeExample snippets={getSnippetsForMethod("PATCH")} />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {config.allowDelete && (
                  <AccordionItem
                    value="delete"
                    className="w-full max-w-full overflow-auto border! px-4"
                  >
                    <AccordionTrigger className="cursor-pointer">
                      DELETE - Deletar registro
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeExample snippets={getSnippetsForMethod("DELETE")} />
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            {/* Salvar */}
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex cursor-pointer items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
