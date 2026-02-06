<?php

namespace App\Services;

use Elastic\Elasticsearch\Client;
use Elastic\Elasticsearch\ClientBuilder;
use Elastic\Elasticsearch\Response\Elasticsearch;

class ElasticsearchService
{
    protected Client $client;

    public function __construct()
    {
        $this->client = ClientBuilder::create()
            ->setHosts([config('services.elasticsearch.host')])
            ->build();
    }

    public function client(): Client
    {
        return $this->client;
    }

    public function search(array $params): Elasticsearch
    {
        return $this->client->search($params);
    }

    public function index(string $index, string $id, array $body): void
    {
        $this->client->index([
            'index' => $index,
            'id'    => $id,
            'body'  => $body,
        ]);
    }

    public function delete(string $index, string $id): void
    {
        $this->client->delete([
            'index' => $index,
            'id'    => $id,
        ]);
    }
}
